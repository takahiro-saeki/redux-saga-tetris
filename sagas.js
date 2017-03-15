import { delay } from 'redux-saga';
import { race, take, put, call, fork, join, select, cancel, takeEvery, takeLatest } from 'redux-saga/effects';
import * as Config from "./game/config";
import * as Actions from './actions';
import * as Types from './types';
import * as Keys from './game/keys';
import * as Board from './game/board';
import Piece from './game/Piece';
import Router from 'next/router';
import seedrandom from 'seedrandom';

function* timeTick() {
  while (true) {
    yield delay(100);
    yield put(Actions.sysTimeTick());
  }
}

function* updateBoard(updater) {
  let board = yield select((state => state.board));
  const newBoard = updater(board);
  yield put(Actions.setBoard(newBoard));
}

function* pieceFall() {
  let piece = new Piece(3, 1, Math.floor(Math.random() * 7), 0);
  console.log(piece);
  yield* updateBoard(board => piece.setTo(board));

  let board = yield select((state => state.board));
  let tick = 0;
  let slackTime = false;
  let slackCounter = 0;
  while (true) {
    if (piece.reachedToBottom(board)) {
      // 落下しおわっても左右の操作や回転を許す「固定時間」の処理。
      if (slackTime === false) {
        slackTime = true;
        slackCounter = 10;
        console.log("  slack time!");
      }
      else if (slackCounter === 0) {
        break;
      }
      else {
        slackCounter--;
        if (keyDown && keyDown.payload === Keys.KEY_ARROW_DOWN){
          // 固定時間時間中に下を押したときは固定時間を解除。
          slackCounter = 0;
        }
      }
    }
    else {
      slackTime = false;
    }
    const { keyDown, timeTick } = yield race({
      keyDown: take(Types.UI_KEY_DOWN),
      timeTick: take(Types.SYS_TIME_TICK),
    });
    if (keyDown && keyDown.payload === Keys.KEY_Q) {
      yield put(Actions.sysGameQuit());
    }
    if (timeTick) {
      tick++;
    }
    if (keyDown || tick % 10 === 0) {
      const nextPiece = piece.nextPiece((keyDown && keyDown.payload) || Keys.KEY_ARROW_DOWN);
      if (nextPiece !== piece) {
        console.log('board=',board, 'piece=',piece);
        let [newBoard, newPiece] = nextPiece.tryPutTo(board, piece);
        yield put(Actions.setBoard(newBoard));
        piece = newPiece;
      }
      board = yield select((state => state.board));
    }
  }
}

function* game() {
  yield call(() => Promise.resolve(Router.push('/game')));
  yield put(Actions.setBoard(Board.INITIAL_BOARD));
  let timeTickTask;
  try {
    timeTickTask = yield fork(timeTick);
    let board = yield select((state => state.board));
    while (!Board.isGameOver(board)) {
      yield* pieceFall();
      board = yield select((state => state.board));
    }
  } finally {
    yield cancel(timeTickTask);
  }
}

export default function* rootSaga() {
  if (Config.PREDICTABLE_RANDOM) {
    Math.seedrandom('tetris');
  }
  yield call(() => Promise.resolve(Router.push('/')));
  while (true) {
    while ((yield take(Types.UI_KEY_DOWN)).payload != Keys.KEY_S) {
      ;
    }
    yield put(Actions.sysGameStart());
    yield put(Actions.setGameRunning(true));
    yield fork(game);
    yield take(Types.SYS_GAME_QUIT);
    yield put(Actions.setGameRunning(false));
    yield call(() => Promise.resolve(Router.push('/')));
  }
}

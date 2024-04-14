import { writable } from 'svelte/store';
import config from './config/config';

const gameStates = {
    pending: 0,
    horizontal: 1,
    vertical: 2,
    diagonal: 3,
    reverseDiagonal: 4,
    draw: 5,
}

const createBoard = (size, main = true) => Array(size).fill().map((_, x) => Array(size).fill().map((__, y) =>
main ? {
    board: createBoard(size, false),
    status: gameStates.pending,
    winPosition: null,
    coords: {x, y},
    value: ''
} : { value: '' }
))

const createGame = () => {
    const {subscribe, set, update} = writable({
        status: gameStates.pending,
        board: createBoard(config.boardSize),
        currentPlayer: config.playerA,
        nextCoords: {x: null, y: null},
        winPosition: null,
    })

    const play = (row, col, { isMain, x = null, y = null }) => update(game => {
        if (!isMain && !checkNextPlay(x, y, game.nextCoords)) {
            return game
        }

        const playedBoard = isMain ? game : game.board[x][y]
        if (playedBoard.board[row][col].value == '' && playedBoard.status === gameStates.pending) {
            playedBoard.board[row][col].value = game.currentPlayer
            const newState = checkGameStatus(playedBoard.board);
            playedBoard.status = newState.state
            if (playedBoard.status) {
                if (!isMain) {
                    play(x, y, { isMain: true })
                }
                playedBoard.winPosition = newState.line ?? null;
            } else {
                game.currentPlayer = game.currentPlayer === config.playerA ? config.playerB : config.playerA;
            }
            if (!isMain) {
                game.nextCoords = game.board[row][col].status === gameStates.pending ? { x: row, y: col } : { x: null, y: null }
            }
        }

        return game
    })

    return { subscribe, play }
}

const checkNextPlay = (x, y, coords) => x === coords.x && y === coords.y || coords.x === null

function checkGameStatus(board) {
    let filledTiles = 0;
    for (let i = 0; i < 3; i++) {
        // Check rows
        if (board[i][0].value === board[i][1].value && board[i][1].value === board[i][2].value && board[i][0].value !== '') {
            return { state: gameStates.horizontal, line: i };
        }
        // Check columns
        if (board[0][i].value === board[1][i].value && board[1][i].value === board[2][i].value && board[0][i].value !== '') {
            return { state: gameStates.vertical, line: i };
        }

        filledTiles += board[i].filter(tile => tile.value !== '').length;
    }

    if (filledTiles === 9) {
        return { state: gameStates.draw };
    }

    // Check diagonals
    if (board[0][0].value === board[1][1].value && board[1][1].value === board[2][2].value && board[0][0].value !== '') {
        return { state: gameStates.diagonal };
    }
    if (board[0][2].value === board[1][1].value && board[1][1].value === board[2][0].value && board[0][2].value !== '') {
        return { state: gameStates.reverseDiagonal };
    }

    return { state: gameStates.pending};
}

const getWinTypeStyle = (winType, position) => {
    let direction = '';
    switch (winType) {
        case gameStates.diagonal:
            direction = 'right top';
            break;
        case gameStates.reverseDiagonal:
            direction = 'left top';
            break;
        case gameStates.horizontal:
            direction = 'top';
            break;
        case gameStates.vertical:
            direction = 'left';
            break;
    }

    let linePosition = 49;
    switch (position) {
        case 0:
            linePosition = 83;
            break;
        case 2:
            linePosition = 16;
            break;
    }

    if (direction) {
        return `background: linear-gradient(to ${direction}, transparent 0%, transparent ${linePosition}%, red ${linePosition}%, red ${linePosition + 2}%, transparent ${linePosition + 2}%, transparent 100%);`;
    }

    return '';
}

const game = createGame()

export { game, gameStates, getWinTypeStyle };

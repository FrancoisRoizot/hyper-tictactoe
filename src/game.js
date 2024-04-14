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
        const playedBoard = isMain ? game : game.board[x][y]
        if (game.board[row][col].value == '' && game.status === gameStates.pending) {
            game.board[row][col].value = game.currentPlayer
            const newState = checkGameStatus(game.board);
            game.status = newState.state
            if (game.status) {
                if (isMain) {
                    //TODO: check si la case est jouable
                    game.nextCoords = { x: row, y: col }
                } else {
                    play(x, y, { isMain: true })
                }
                game.winPosition = newState.line ?? null;
            } else {
                game.currentPlayer = game.currentPlayer === config.playerA ? config.playerB : config.playerA;
            }
        }

        return game
    })

    return { subscribe, play }
}


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
    if (winType === gameStates.horizontal || winType === gameStates.vertical) {
        switch (position) {
            case 0:
            linePosition = 83;
            break;
            case 2:
            linePosition = 16;
            break;
        }
    }

    if (direction) {
        return `background: linear-gradient(to ${direction}, transparent 0%, transparent ${linePosition}%, red ${linePosition}%, red ${linePosition + 1}%, transparent ${linePosition + 1}%, transparent 100%);`;
    }

    return '';
}

const game = createGame()

export { game, gameStates, getWinTypeStyle };

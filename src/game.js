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

const gameModes = {
    hyperTikTakToe: {
        hasChild: true,
        play(playedBoard, { isMain, x, y }, playCallback) {
            if (!playedBoard.status) {
                return
            }

            if (playedBoard.status === gameStates.draw) {
                playedBoard.board = createBoard(false)
            } else if (!isMain) {
                playCallback()
            }
        },
        reset() {

        }
    },
    ghostTikTakToe: {
        hasChild: false,
        history: [],
        play(playedBoard, { isMain, row: x, col: y }, playCallback) {
            this.history.push({x, y})

            if (this.history.length > 5) {
                const coord = this.history.shift()
                playedBoard.board[coord.x][coord.y].value = ''
            }
        },
        reset() {
            this.history = []
        }
    },
}

const createBoard = hasChild =>
    Array(3).fill().map((_, x) =>
        Array(3).fill().map((__, y) =>
            hasChild ? {
                board: createBoard(false),
                status: gameStates.pending,
                winPosition: null,
                coords: {x, y},
                value: ''
            } : { value: '' }
        ))

const createGame = () => {

    const {subscribe, set, update} = writable({
        status: gameStates.pending,
        board: createBoard(gameModes.ghostTikTakToe.hasChild),
        currentPlayer: config.playerA,
        nextCoords: {x: null, y: null},
        winPosition: null,
        currentGameMode: 'ghostTikTakToe',
        hasChild: gameModes.ghostTikTakToe.hasChild,
        gameModes,
    })

    const changeGameMode = gameMode => update(game => {
        game.currentGameMode = gameMode
        resetGame()

        return game
    })

    const resetGame = () => update(game => {
        console.log(gameModes[game.currentGameMode])
        game.board = createBoard(gameModes[game.currentGameMode].hasChild)
        game.status = gameStates.pending
        game.currentPlayer = config.playerA
        game.nextCoords = {x: null, y: null}
        game.winPosition = null
        game.hasChild = gameModes[game.currentGameMode].hasChild

        gameModes[game.currentGameMode].reset()

        return game
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
            gameModes[game.currentGameMode].play(playedBoard, { isMain, row, col }, () => play(x, y, { isMain: true }))

            if (playedBoard.status) {
                playedBoard.winPosition = newState.line ?? null;
            } else {
                nextPlayer()
            }

            if (!isMain) {
                game.nextCoords = game.board[row][col].status === gameStates.pending ? { x: row, y: col } : { x: null, y: null }
            }
        }

        return game
    })

    const nextPlayer = () => update(game => {
        game.currentPlayer = game.currentPlayer === config.playerA ? config.playerB : config.playerA

        return game
    })

    return { subscribe, play, resetGame, changeGameMode }
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

    return { state: gameStates.pending };
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

<script>
  import { game, getWinTypeStyle } from "../game";

  export let coords = { x: null, y: null };

  const isMain = coords.x === null && coords.y === null
  $: playedBoard = isMain ? $game : $game.board[coords.x][coords.y]

  $: isTileToPlay = coords => {
    return !$game.status && isMain && $game.nextCoords.x === coords?.x && $game.nextCoords.y === coords?.y
  }

  const play = (i, j) => {
    if((!isMain || !$game.hasChild) && !$game.status) {
      game.play(i, j, { isMain, ...coords })
    }
  }
</script>

<div class="game-container">
  <table class="tictactoe-board {isMain ? 'parent' : 'child'}">
    {#each playedBoard.board as row, i}
      <tr>
        {#each row as cell, j}
          <td on:click="{() => play(i, j)}" class="holder {isTileToPlay(cell?.coords) ? 'green' : ''}">
            {#if isMain && $game.hasChild}
              <svelte:self bind:coords={cell.coords} />
            {/if}
            <div class="{isMain ? 'big-one' : ''} {!$game.hasChild ? 'simple' : ''}">
              {cell.value}
            </div>
          </td>
        {/each}
      </tr>
    {/each}
  </table>
  <div class="win-overlay" style={getWinTypeStyle(playedBoard.status, playedBoard.winPosition)}></div>
</div>

<script>
  import { game, getWinTypeStyle } from "../game";

  export let coords = { x: null, y: null };

  const isMain = coords.x === null && coords.y === null
  $: playedBoard = isMain ? $game : $game.board[coords.x][coords.y]

  $: isTileToPlay = (coords) => isMain && $game.nextCoords.x === coords.x && $game.nextCoords.y === coords.y
</script>

<div class="game-container">
  <table class="tictactoe-board {isMain ? 'parent' : 'child' }">
    {#each playedBoard.board as row, i}
    <tr>
      {#each row as cell, j}
      <td on:click="{() => !isMain && game.play(i, j, { isMain, ...coords })}" class="holder {isTileToPlay(cell.coords) ? 'green' : ''}">
        {#if isMain}
        <svelte:self bind:coords={cell.coords} />
        {/if}
        <div class="{isMain ? 'big-one' : ''}">
          {cell.value}
        </div>
      </td>
      {/each}
    </tr>
    {/each}
  </table>
  <div class="win-overlay" style={getWinTypeStyle(playedBoard.status, playedBoard.winPosition)}></div>
</div>

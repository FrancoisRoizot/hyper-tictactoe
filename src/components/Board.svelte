<script>
  import { game, getWinTypeStyle } from "../game";

  export let coords = { x: null, y: null };

  const isMain = (coords.x === null && coords.y === null)
  console.log(coords);
  $: board = isMain ? $game.board[coords.x][coords.y].board : $game.board
</script>

<div class="game-container">
  <table class="tiktaktoe-board">
    {#each board as row, i}
    <tr>
      {#each row as cell, j}
      <td on:click="{() => game.play(i, j, { isMain })}">
        <div class="holder">
          <div class="big-one">
            {cell.value}
          </div>
          {#if isMain}
          <svelte:self bind:coords={cell.coords} />
          {/if}
        </div>
      </td>
      {/each}
    </tr>
    {/each}
  </table>
  <div class="win-overlay" style={getWinTypeStyle($game.status, $game.winPosition)}></div>
</div>

<style>
  /** parent */

  .holder {
    position: relative;
  }

  .big-one {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 8em;
  }

  td {
    border-top: 7px solid #f0f0f0;
    border-left: 7px solid #f0f0f0;
    padding: 20px;
  }

  tr:first-child > td {
    border-top: none;
  }

  td:first-child {
    border-left: none;
  }

  /** child */
  table {
    border-collapse: collapse;
  }
  td {
    width: 75px;
    height: 75px;
  }
</style>

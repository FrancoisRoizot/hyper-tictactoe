<script>
  import Board from "./components/Board.svelte";
  import { game } from "./game";
</script>

<select value={$game.currentGameMode} on:change={e => game.changeGameMode(e.target.value)}>
  {#each Object.keys($game.gameModes) as mode}
    <option value={mode}>{mode}</option>
  {/each}
</select>

{#if $game.status}
  <p>Congratulations! Player {$game.currentPlayer} has won!</p>
  <button on:click={game.resetGame}>Reset</button>
{:else}
  <p>Current Player: {$game.currentPlayer}</p>
{/if}

<Board />

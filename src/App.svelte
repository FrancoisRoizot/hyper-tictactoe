<script>
  import Board from "./components/Board.svelte";
  import { game } from "./game";
</script>

{#if $game.status}
<p>Congratulations! Player {$game.currentPlayer} has won!</p>
<button on:click={game.resetGame}>Reset</button>
{:else}
<p>Current Player: {$game.currentPlayer}</p>
{/if}

<Board />

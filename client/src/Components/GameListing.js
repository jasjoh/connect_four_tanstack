import { useNavigate } from 'react-router-dom';
import "./GameListing.css";

/** Displays a specific game listing
 *
 * Props:
 *  - game: A game object like:
 *
 *    id: string;
      gameState: number;
      placedPieces: number[][] | null;
      boardId: string,
      boardData: BoardDataType;
      boardWidth: number;
      boardHeight: number;
      winningSet: number[][] | null;
      currPlayerId: string | null;
      createdOn: Date;
      totalPlayers: number;
 *
 * State:
 *  - None
 *
 * GameList -> GameListing */
function GameListing({ game }) {
  // console.log("GameListing re-rendered");

    const navigate = useNavigate();

    function gameClick(evt) {
      // console.log("Game row clicked. Navigating to:", `/games/${game.id}`);
      navigate(`/games/${game.id}`);
    }

  return (
    <tr onClick={gameClick} className="GameListing-tr">
      <td className="GameListing-td">{`${game.id}`}</td>
      <td className="GameListing-td">{`${game.gameState}`}</td>
      <td className="GameListing-td">{`${game.createdOn}`}</td>
      <td className="GameListing-td">{`${game.totalPlayers}`}</td>
    </tr>
  );
}

export default GameListing;
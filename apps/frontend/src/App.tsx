import classNames from "classnames";
import { GameBoard } from "./components/GameBoard";
import { GameHeader } from "./components/GameHeader";
import { LeaderBoard } from "./components/LeaderBoard";
import { PlayerNameInput } from "./components/PlayerNameInput";
import { useHasGameStarted } from "./hooks/useHasGameStarted";


function App() {

  const gameStarted = useHasGameStarted();

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <GameHeader />
        <div className="mb-6">
          <PlayerNameInput />
        </div>
        <div className="grid md:grid-cols-3 gap-4"
        >
          <div className={classNames("md:col-span-2 order-2 md:order-1", { "opacity-50": !gameStarted })}>
            <GameBoard />
          </div>
          <div className="order-1 md:order-2">
            <LeaderBoard />
          </div>
        </div>
      </div>
    </div>
  );

}

export default App;

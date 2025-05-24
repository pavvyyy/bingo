import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Button } from "./ui/Button";

const generateBoard = (size, wordBank) => {
  const shuffled = [...wordBank].sort(() => 0.5 - Math.random());
  return Array.from({ length: size }, (_, i) =>
    Array.from({ length: size }, (_, j) => shuffled[i * size + j])
  );
};

const checkWinLines = (selected, size) => {
  const winningLines = [];

  for (let i = 0; i < size; i++) {
    if (selected[i]?.every(Boolean)) winningLines.push(`row-${i}`);
  }

  for (let j = 0; j < size; j++) {
    if (selected.every(row => row?.[j])) winningLines.push(`col-${j}`);
  }

  if (selected.every((row, i) => row?.[i])) winningLines.push("diag-main");
  if (selected.every((row, i) => row?.[size - 1 - i])) winningLines.push("diag-anti");

  return winningLines;
};

const checkFullHouse = (selected) => selected.flat().every(Boolean);

export default function BingoApp() {
  const [size, setSize] = useState(5);
  const [pendingSize, setPendingSize] = useState(5);
  const [wordBank, setWordBank] = useState([
    "Apple", "Banana", "Carrot", "Dog", "Elephant", "Fish", "Giraffe", "Hat", "Igloo", "Jacket",
    "Kite", "Lion", "Monkey", "Notebook", "Orange", "Penguin", "Queen", "Robot", "Sun", "Tiger",
    "Umbrella", "Violin", "Whale", "Xylophone", "Yak", "Zebra"
  ]);
  const [board, setBoard] = useState([]);
  const [selected, setSelected] = useState([]);
  const [bingoShown, setBingoShown] = useState(false);
  const [fullHouseShown, setFullHouseShown] = useState(false);
  const [achievedLines, setAchievedLines] = useState([]);
  const [dialog, setDialog] = useState(null);
  const [boardLocked, setBoardLocked] = useState(false);

  const initializeBoard = (boardSize) => {
    const newBoard = generateBoard(boardSize, wordBank);
    setBoard(newBoard);
    setSelected(Array.from({ length: boardSize }, () => Array(boardSize).fill(false)));
    setBingoShown(false);
    setFullHouseShown(false);
    setAchievedLines([]);
    setBoardLocked(false);
  };

  useEffect(() => {
    initializeBoard(size);
  }, [size]);

  const handleClick = (i, j) => {
    if (boardLocked || !selected[i] || selected[i][j]) return;

    const updated = selected.map(row => [...row]);
    updated[i][j] = true;
    setSelected(updated);

    const newLines = checkWinLines(updated, size);
    const newBingos = newLines.filter(line => !achievedLines.includes(line));

    const willBeFullHouse = checkFullHouse(updated);

    if (newBingos.length > 0 && !(willBeFullHouse && !fullHouseShown)) {
      setAchievedLines([...achievedLines, ...newBingos]);
      setBoardLocked(true);
      setBingoShown(true);
      setTimeout(() => {
        setBingoShown(false);
        setBoardLocked(false);
      }, 3000);
    }

    if (willBeFullHouse && !fullHouseShown) {
      setFullHouseShown(true);
      confetti();
    }
  };

  const confirmChangeBoard = () => {
    setDialog({
      message: "Do you want to generate a new board with the selected size?",
      onConfirm: () => {
        setSize(pendingSize);
        setDialog(null);
      },
    });
  };

  const confirmClearBoard = () => {
    setDialog({
      message: "Do you want to clear the board? All selections will be lost.",
      onConfirm: () => {
        setSelected(Array.from({ length: size }, () => Array(size).fill(false)));
        setBingoShown(false);
        setFullHouseShown(false);
        setAchievedLines([]);
        setDialog(null);
      },
    });
  };

  const handleStartAgain = () => {
    initializeBoard(size);
    setFullHouseShown(false);
  };

  return (
    <div className="flex flex-col items-center p-4 space-y-4">
      <div className="flex items-center space-x-2">
        <label className="mr-2">Grid Size:</label>
        <select
          value={pendingSize}
          onChange={(e) => setPendingSize(Number(e.target.value))}
          className="border rounded p-1 text-center"
        >
          {[3, 4, 5, 6].map((val) => (
            <option key={val} value={val}>{`${val} x ${val}`}</option>
          ))}
        </select>
        <Button onClick={confirmChangeBoard}>Change board</Button>
        <Button variant="outline" onClick={confirmClearBoard}>Clear board</Button>
      </div>

      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(60px, 1fr))` }}
      >
        {board.flat().map((word, idx) => {
          const i = Math.floor(idx / size);
          const j = idx % size;
          const isSelected = selected[i]?.[j];
          return (
            <Button
              key={`${i}-${j}`}
              className={`h-16 transition-all ${
                isSelected
                  ? "bg-green-700 text-black cursor-default"
                  : "bg-white text-black hover:bg-blue-100"
              }`}
              onClick={() => handleClick(i, j)}
              disabled={isSelected}
            >
              {word}
            </Button>
          );
        })}
      </div>

      <AnimatePresence>
        {(bingoShown || fullHouseShown) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black bg-opacity-50 z-40" />
            <div
              className={`relative z-50 px-10 py-6 rounded shadow-lg text-4xl font-bold text-center flex flex-col items-center space-y-4 ${
                bingoShown ? "bg-yellow-300 text-black" : "bg-green-600 text-white"
              }`}
            >
              {bingoShown ? "🎉 BINGO! 🎉" : "🎊 FULL HOUSE! 🎊"}
              {fullHouseShown && (
                <Button className="mt-2" onClick={handleStartAgain}>
                  Start Again
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {dialog && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg text-center">
            <p className="mb-4 text-lg">{dialog.message}</p>
            <div className="space-x-4">
              <Button onClick={dialog.onConfirm}>Yes</Button>
              <Button variant="outline" onClick={() => setDialog(null)}>No</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
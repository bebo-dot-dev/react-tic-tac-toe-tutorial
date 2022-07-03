import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

function Square(props) {
  return (
    <button
      className={props.winner ? "square winner" : "square"}
      onClick={props.onClick}>
      {props.value}
    </button>
  );
}

class Board extends React.Component {    
  renderSquare(squareIdx) {
    return (
      <Square key={squareIdx}
        value={this.props.squares[squareIdx]}
        onClick={() => this.props.onClick(squareIdx)}
        winner={this.props.winLine && this.props.winLine.includes(squareIdx)}
      />
    );
  }

  render() {   
    const boardSize = 3;
    let board = [];
    for(let i = 0; i < boardSize; i++) {
      let squares = [];

      for(let j = 0; j < boardSize; j++) {
        squares.push(this.renderSquare(i * boardSize + j));
      }

      board.push(<div key={i} className="board-row">{squares}</div>);
    } 
    return (
      <div>{board}</div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
        lastSquareIdx: 0,
      }],
      sortAscending: true,
      stepNumber: 0,
      xIsNext: true,
    };
  }

  handleClick(squareIdx) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[history.length - 1];
    const squares = current.squares.slice();
    
    if (calculateWinner(squares).winner || squares[squareIdx]) {
      return;
    }
    squares[squareIdx] = this.state.xIsNext ? 'X' : 'O';
    this.setState({
      history: history.concat([{
        squares: squares,
        lastSquareIdx: squareIdx
      }]),
      stepNumber: history.length,
      xIsNext: !this.state.xIsNext,
    });
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
  }

  handleHistorySort() {
    this.setState({
      sortAscending: !this.state.sortAscending
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];

    const winInfo = calculateWinner(current.squares);
    const winner = winInfo.winner;
    
    const moves = history.map((step, moveIdx) => {

      const lastSquareIdx = step.lastSquareIdx;
      const col = (lastSquareIdx % 3) + 1;
      const row = (Math.floor(lastSquareIdx / 3)) + 1;
      
      const desc = moveIdx ?
        `Go to move #${moveIdx} (${col}, ${row})` :
        'Go to game start';
      return (
        <li key={moveIdx}>
          <button
            className={this.state.stepNumber === moveIdx ? "bold" : ""}
            onClick={() => this.jumpTo(moveIdx)}>{desc}
          </button>
        </li>
      );
    });

    if (!this.state.sortAscending) {
      moves.reverse();
    }

    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else if (this.state.stepNumber === 9) {
      status = 'Draw';
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            winLine={winInfo.line}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <button onClick={() => this.handleHistorySort()}>Change sort</button>
          <ol>{moves}</ol>          
        </div>
      </div>
    );
  }
}

// ========================================

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<Game />);

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        line: lines[i],
      };
    }
  }

  return {
    winner: null,
  };
}
import { findByLabelText } from '@testing-library/dom';
import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const m = 20;
const n = 20;

class Square extends React.Component {
render() {
return (
    <button className="square" 
        style={{backgroundColor: this.props.value ? '#c37979' : '#ffffff',
                transition: "all .5s ease",
                WebkitTransition: "all .5s ease",
                MozTransition: "all .5s ease"}} 
        onClick={this.props.onClick} >
        {
        // this.props.value ? "1" : "0"
        }
    </button>
);
}
}

class Board extends React.Component {
renderSquare(pair) {
    return (
    <Square
        value={pair.value}
        onClick={() => this.props.onClick(pair.i)}
    />
    );
}

render() {
    let board = this.props.board;
    
    return (
    <div classname="board">
        {
            board.map((singleRow) => {return (<div className="board-row">
                {singleRow.map(singleCol => {
                    return this.renderSquare(singleCol);
                })}
                
            </div>)})
        }
    </div>
    );
}
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
  

class Game extends React.Component {
constructor(props) {
    super(props);
    var cnt = 0;
    let defaultBoard = Array(m).fill(null).map(() => (Array(n)));
    for (let i = 0 ; i < defaultBoard.length; i++) {
        for (let j = 0; j < defaultBoard[0].length; j++) {
            defaultBoard[i][j] = {i: cnt, value: false};
            cnt++;
        }
    }
    let history = [];
    this.isRunning = false;
    this.state = {
        board: defaultBoard,
        stepNumber: 0,
        history: [defaultBoard],
    };
}

handleClick(i) {
    if (this.isRunning) {return;}
    var row_index = Math.floor(i/m);
    var col_index = i% n;
    let updatedBoard = this.state.board.slice();
    updatedBoard[row_index][col_index] = {i: i, value: !this.state.board[row_index][col_index].value};
    this.setState({
        board: updatedBoard,
    })
}

nextGen() {
    console.log("next gened");
    var m = this.state.board.length;
    var n = this.state.board[0].length;
    
    let updatedBoard = JSON.parse(JSON.stringify(this.state.board));

    let hasChanged = false;
    for (let i = 0 ; i < m; i++) {
        for (let j = 0 ; j < n; j++) {
            let cnt = 0;
            if (i - 1 >= 0 && j-1 >= 0 && this.state.board[i-1][j-1].value) {cnt++;}
            if (i - 1 >= 0 && this.state.board[i-1][j].value) {cnt++;}
            if (i - 1 >= 0 && j+1 < n && this.state.board[i-1][j+1].value) {cnt++;}
            if (j - 1 >= 0 && this.state.board[i][j-1].value) {cnt++;}
            if (j + 1 < n && this.state.board[i][j+1].value) {cnt++;}
            if (i + 1 < m && j-1 >= 0 && this.state.board[i+1][j-1].value) {cnt++;}
            if (i + 1 < m && this.state.board[i+1][j].value) {cnt++;}
            if (i + 1 < m && j+1 < n && this.state.board[i+1][j+1].value) {cnt++;}
            
            if (cnt < 2) {
                updatedBoard[i][j] = {i: this.state.board[i][j].i, value: false};
            } else if (cnt == 2) {
                updatedBoard[i][j] = {i: this.state.board[i][j].i, value: this.state.board[i][j].value};
            } else if (cnt == 3) {
                updatedBoard[i][j] = {i: this.state.board[i][j].i, value: true};
            } else {
                updatedBoard[i][j] = {i: this.state.board[i][j].i, value: false};
            }

            if (updatedBoard[i][j].value != this.state.board[i][j].value) {
                hasChanged = true;
            }
        }
    }
    
    let updatedHistory = this.state.history.slice(0, this.state.stepNumber + 1);
    updatedHistory.push(updatedBoard);
    this.setState({
        board: updatedBoard,
        history: updatedHistory,
        stepNumber: this.state.stepNumber + 1,
    })
    if (!hasChanged) {
        this.isRunning = false;
    }
}

reset() {
    console.log("Reset");
    var cnt = 0;
    let defaultBoard = Array(m).fill(null).map(() => (Array(n)));
    for (let i = 0 ; i < defaultBoard.length; i++) {
        for (let j = 0; j < defaultBoard[0].length; j++) {
            defaultBoard[i][j] = {i: cnt, value: false};
            cnt++;
        }
    }
    let history = [];
    this.isRunning = false;
    this.setState({
        board: defaultBoard,
        stepNumber: 0,
        history: [defaultBoard],
    });
}

endGame() { 
   this.isRunning = false;
}

async startGame() {
    if (this.isRunning) {return;}
    this.isRunning = true;
    let prevHistory = this.state.history.slice(0, this.state.stepNumber + 1);
    this.setState({
        history: prevHistory,
    })

    while (this.isRunning) {
        this.nextGen();
        await sleep(2000);
    }
}



jumpTo(step) {
    let currentBoard = this.state.history[step];
    this.setState({
        stepNumber: step,
        board: currentBoard,
    });
}

render() {
    const moves = this.state.history.map((board, index) => {
        const desc = 'Go to generation #' + index;
        return (
            <li>
                <button onClick = {() => this.jumpTo(index)}>{desc}</button> 
            </li>
        );
    });


    return (
    <div className="game">
        
        <div className="game-info">
            <div >Conway's Game of Life</div>
            <div>
            <button onClick={() => this.startGame()}>Start</button>
            <button onClick={() => this.endGame()}>End</button>
            <button onClick={() => this.reset()}>Reset</button>
            </div>
            <ol>{moves}</ol>
        </div>
        <div className="game-board">
        <Board
            board={this.state.board}
            onClick={(i) => this.handleClick(i)}
        />
        </div>
    </div>
    );
}
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

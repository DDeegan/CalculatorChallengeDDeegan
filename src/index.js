import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';



class Keypad extends React.Component { //the keypad as a whole
    constructor(props) {
        super(props);
        this.state = {
            equation: '',
            parenFlip: false,
            error: false,
        };
    }
    
    renderKey(i) {
        return (
        <Key 
           value={i}
           onClick={() => this.handleClick(i)}  
        />
        );
      }
    
    renderDisplay(i) {
        return (
            <Display 
                value={i}  
            />
        );
    }

    handleClick(i) {
        if(this.state.error){ //if previous command was an error, clear on any key
          i = 'c';
          this.setState({
            error: false
          });
        }
        //import contents of key pressed
        switch (i){
        case "del": //remove last character
            this.setState({
                equation: this.state.equation.substring(0, this.state.equation.length-1)
            });
            return;
        case 'c': //clear display
            this.setState({
                equation: ''
            });
            break;
        case '=': //parse input string, do equation
            var nums = eqParse(this.state.equation);
            nums = parenCheck(nums, 0); //clear out parenthetical expressions
            var val = "" + doMath(nums); //string, not array
            if(val[0] === 'E' || val[0] === '?'){ //error handling
              this.setState({
                error:true
              });
            }
            this.setState({
              equation: val
            });
            break;
        default: //add inputted key to expression
            this.setState({
                equation: this.state.equation + i
            });
        }   
    }

      render() {
        return (
          <div className = "border">
            <div className="board-row" >
                {this.renderDisplay(this.state.equation)}
            </div>
            <div className="board-row">
              {this.renderKey(7)}
              {this.renderKey(8)}
              {this.renderKey(9)}
              {this.renderKey('+')}
              {this.renderKey('(')}
              {this.renderKey(')')}
            </div>
            <div className="board-row">
              {this.renderKey(4)}
              {this.renderKey(5)}
              {this.renderKey(6)}
              {this.renderKey('-')}
              {this.renderKey('^')}
              {this.renderKey('')}
            </div>
            <div className="board-row">
              {this.renderKey(1)}
              {this.renderKey(2)}
              {this.renderKey(3)}
              {this.renderKey('x')}
              {this.renderKey('!')}
              {this.renderKey('')}
            </div>
            <div className="board-row">
              {this.renderKey(0)}
              {this.renderKey('.')}
              {this.renderKey("del")}
              {this.renderKey('/')}
              {this.renderKey('c')}
              {this.renderKey('=')}
            </div>
          </div>
        );
      }

    //HandleCLick(

    //)
}

ReactDOM.render(
    <Keypad />,
    document.getElementById('root')
);

function Key(props) { //the individual keys

    return (
      <button className="key" onClick={props.onClick}>
        {props.value}
      </button>
    );
  }

function Display(props) { //the display where inout and solutions appear
    return (
        <button className="display">
            {props.value}
        </button>
    );
}

function eqParse(eq){
  const elements = []; //array of each number and symbol individually
  var index = 0;
  var slot = 0;
  var canDot = true; //whether a decimal has been used in the current number
  var canSymbol = false; //whether a symbol is valid (not at the start or right after another)
  var canEnd = true; //whether end is valid (not a symbol or dot)
  var canNum = true; //whether a number is valid (not after a closeparen or !)
  var openParen = 0; //how many open parens
  var canOpen = true; //wheter open paren is valid (at start or after a symbol)
  var canNeg = true; //can place a negative sign (at start or after open paren)
  var c = ''; //current character being parsed
  var parser = ""; //current string of numbers
  while(index < eq.length){
    c = eq.charAt(index);
    switch (c) {
      case '+':
      case 'x':
      case '/':
      case '^':
        if(!canSymbol){
          return ('?');
        }
        else{
          //add currently parsed number to the array, add symbol to the array
          elements[slot] = parser;
          parser = "";
          slot++;
          elements[slot] = c;
          slot++;
          canSymbol = false;
          canEnd = false;
          canDot = true;
          canNum = true;
          canNeg = false;
        }
        break;
      case '-':
        if(canSymbol){
          elements[slot] = parser;
          parser = "";
          slot++;
          elements[slot] = c;
          slot++;
          canSymbol = false;
          canEnd = false;
          canDot = true;
          canNum = true;
          canNeg = false;
        }
        else if(canNeg){
          parser += c; //symbol and negative sign are never valid at the same time
          canEnd = false;
          canNeg = false;
        }
        else{
          return '?';
        }
        break;
      case '!':
        if(!canSymbol){
          return ("?");
        }
        else{
          elements[slot] = parser;
          parser = "!";
          slot++;
          canSymbol = true;
          canEnd = true;
          canDot = true;
          canNum = false;
          canOpen = false; //a factorial can only be followed by a symbol
        }
        break;
      case '.':
        if(!canDot || !canNum){
          return("?");
        }
        else{
          parser += '.';
          canDot = false;
          canSymbol = false;
          canEnd = false;
          canOpen = false;
          canNeg = false; //only one dot in a number
        }
        break;
      case '(':
        if(!canOpen){
          return("?");
        }
        elements[slot] = c;
        slot++;
        canSymbol = false;
        canDot = true;
        canNeg = true;
        openParen++;
        break;
      case ')':
        if(openParen <= 0){
          return("?");
        }
        elements[slot] = parser;
        parser = ")";
        slot++;
        elements[slot] = c;
        canSymbol = true;
        canDot = true;
        canNum = false;
        canNeg = false;
        openParen--;
        break;
      default:
        if(!canNum){
          return("?");
        }
        parser += c;
        canSymbol = true;
        canEnd = true;
        canOpen = true;
    }
    index++;
  }
  elements[slot] = parser;
  if(!canEnd || openParen !== 0){
    return "?";
  }
  return elements;
}

//see if there are any parentheticals in the equation, if so evaluate them
function parenCheck(nums, startPos){
  for(let i = startPos; i < nums.length; i++){
    if(nums[i] === '('){
      return parenClear(parenCheck(nums, i+1), i);
    }
  }
  return nums;
}

//evaluate parens, replace in array with result
function parenClear(nums, i){
  for(let j = i; j < nums.length; j++){
    if(nums[j] === ')'){
      nums.splice(i, j-i+1, doMath(nums.slice(i+1, j)));
      return nums;
    }
  }
  return '?';
}

function factorial(n){
  //base case
  if(n === 0 || n === 1){
      return 1;
  //recursive case
  }else{
      return n * factorial(n-1);
  }
}

function doMath(nums){
  //exponent
  for(let i = 0; i < nums.length; i++){
    if(nums[i] === '^'){
      nums.splice(i-1, 3, Math.pow(parseFloat(nums[i-1]),parseFloat(nums[i+1])));
    }
  }
  //factorial
  for(let i = 0; i < nums.length; i++){
    if(nums[i] === '!'){
      if(nums[i-1] < 0){
        return("ERROR: NEG. FACTORIAL");
      }
      nums.splice(i-1, 2, factorial(parseFloat(nums[i-1])));
    }
  }
  //mult/div
  for(let i = 0; i < nums.length; i++){
    switch(nums[i]){
      case 'x':
        nums.splice(i-1, 3, parseFloat(nums[i-1]) * parseFloat(nums[i+1]));
        i--;
        break;
      case '/':
        if(parseFloat(nums[i+1]) === 0){
          return("ERROR: DIVIDE BY 0");
        }
        nums.splice(i-1, 3, parseFloat(nums[i-1]) / parseFloat(nums[i+1]));
        i--;
        break;
      default:
        break;
    }
  }
  //add/sub
  for(let i = 0; i < nums.length; i++){
    switch(nums[i]){
      case '+':
        console.log(nums[i-1] + " " + nums[i+1])
        nums.splice(i-1, 3, parseFloat(nums[i-1]) + parseFloat(nums[i+1]));
        i--;
        console.log(nums[i]);
        console.log(nums);
        break;
      case '-':
        nums.splice(i-1, 3, parseFloat(nums[i-1]) - parseFloat(nums[i+1]));
        i--;
        break;
      default:
        break;
    }
  }
  return nums;
}
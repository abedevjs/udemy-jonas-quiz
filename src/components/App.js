import { Fragment, useEffect, useReducer } from "react";
import Header from "./Header";
import Main from "./Main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./StartScreen";
import Question from "./Question";
import NextButton from "./NextButton";
import Progress from "./Progress";
import Finished from "./Finished";
import Timer from "./Timer";
import Footer from "./Footer";

const SECS_PER_QUESTION = 30;
const initialState = {
  questions: [],
  status: "loading",
  index: 0,
  answer: null,
  points: 0,
  highscore: 0,
  secondsRemaining: 10,
};
function reducer(currentState, action) {
  switch (action.type) {
    case "dataReceived":
      return { ...currentState, questions: action.payload, status: "ready" };
    case "dataFailed":
      return { ...currentState, status: "error" };
    case "start":
      return {
        ...currentState,
        status: "active",
        secondsRemaining: currentState.questions.length * SECS_PER_QUESTION,
      };
    case "newAnswer":
      const question = currentState.questions.at(currentState.index);
      return {
        ...currentState,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? currentState.points + question.points
            : currentState.points,
      };
    case "nextQuestion":
      return {
        ...currentState,
        index: currentState.index + 1,
        answer: initialState.answer,
      };
    case "finish":
      return {
        ...currentState,
        status: "finished",
        highscore:
          currentState.points > currentState.highscore
            ? currentState.points
            : currentState.highscore,
      };
    case "restart":
      return {
        ...initialState,
        status: "ready",
        questions: currentState.questions,
        highscore: currentState.highscore,
      };
    case "tick":
      return {
        ...currentState,
        secondsRemaining: currentState.secondsRemaining - 1,
        status:
          currentState.secondsRemaining === 0
            ? "finished"
            : currentState.status,
      };
    default:
      throw new Error("Action unknown");
  }
}

export default function App() {
  const [
    { questions, status, index, answer, points, highscore, secondsRemaining },
    dispatch,
  ] = useReducer(reducer, initialState);
  const numQuestions = questions.length;

  // Jonas Solution
  const maxPossiblePoint = questions.reduce(
    (prev, cur) => prev + cur.points,
    0
  );
  // My Solution: Cara mengakses property n value dalam list of OBJECT inside an ARRAY
  // const maxPossiblePoint = questions
  //   .map((obj) => obj.points)
  //   .reduce((acc, point) => acc + point, 0);

  useEffect(function () {
    fetch("http://localhost:8000/questions")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "dataReceived", payload: data }))
      .catch((error) => dispatch({ type: "dataFailed" }));
  }, []);

  return (
    <div className="app">
      <Header />
      <Main>
        {status === "loading" && <Loader />} {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
        )}
        {status === "active" && (
          <Fragment>
            <Progress
              index={index}
              numQuestions={numQuestions}
              points={points}
              maxPoints={maxPossiblePoint}
              answer={answer}
            />
            <Question
              question={questions[index]}
              dispatch={dispatch}
              answer={answer}
            />
            <Footer>
              <Timer dispatch={dispatch} secondsRemaining={secondsRemaining} />
              <NextButton
                dispatch={dispatch}
                answer={answer}
                index={index}
                numQuestions={numQuestions}
              />
            </Footer>
          </Fragment>
        )}
        {status === "finished" && (
          <Finished
            points={points}
            maxPossiblePoints={maxPossiblePoint}
            highscore={highscore}
            dispatch={dispatch}
          />
        )}
      </Main>
    </div>
  );
}

import Options from "./Options";

function Question({ question, dispatch, answer }) {
  return (
    <div>
      <h4>
        {question.question}{" "}
        <em style={{ fontSize: "16px" }}>(Point: {question.points})</em>{" "}
      </h4>
      <Options question={question} dispatch={dispatch} answer={answer} />
    </div>
  );
}

export default Question;

import React from "react";
import Error from "../components/error/Error";

export default function ErrorPage(prop) {
  return (
    <div>
      <Error errorMessage={"We couldn't find your page!"} errorCode={404} />
    </div>
  );
}

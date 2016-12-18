/*
 *
 * this is a temporary custom render for statements
 * after we land passing variables to the RenderLavaTemplate api
 * we can deprecated this and move to looking up a merge template and rendering
 * it instead.
*/

import React from "react";
import ReactDOMServer from "react-dom/server";
import pdf from "html-pdf";
import uuid from "node-uuid";

const generatePDF = (component) => {
  const html = ReactDOMServer.renderToStaticMarkup(component);
  return new Promise((r, f) => {
    pdf.create(html, {
      format: "letter",
      border: {
        top: "0.6in",
        right: "0.6in",
        bottom: "0.6in",
        left: "0.6in",
      },
    }).toBuffer((err, buffer) => {
      if (err) return f(err);

      r(buffer.toString("base64"));
    });
  });
};

const Statement = ({ transactions, person }) => (
  <div>
    <style>{`
      body {
        color: blue;
      }
    `}</style>
    <h1>React from Heighliner</h1>
  </div>
);


export default (props) => generatePDF(<Statement {...props} />);



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

export const generatePDF = (component) => {
  const html = ReactDOMServer.renderToStaticMarkup(component);
  console.log("component = ", component);
  console.log("html = ", html);
  return new Promise((r, f) => {
    // XXX James says this isn't really worth mocking independent parts
    // of pdf.create. So instead we just verify it fails, or returns a base64 stringify
    // from a given react component
    pdf
      .create(html, {
        format: "letter",
        border: {
          top: "0.6in",
          right: "0.6in",
          bottom: "0.6in",
          left: "0.6in",
        },
      })
      .toBuffer((err, buffer) => {
        if (err) return f(err);

        r(buffer.toString("base64"));
      });
  });
};

export const formatMoney = amount => `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;

export const Statement = ({ transactions, person, home, total }) => (
  <html>
    <head>
      <style>{`
        html,
        body {
          height: 100%;
        }
        @media all {
          .page-break {
            display: block;

            page-break-before: always;
          }
        }

        @media print {
          .page-break {
            display: block;

            page-break-before: always;
          }
        }
        .container {
          margin: 0 auto;
        }

        .pre-text {
          font-family: "Courier New";
          font-size: 12px;
          line-height: 1.4em;
        }

        .print-subheader {
          color: black;
          font-family: "Helvetica";
        }

        #logo-img {
          margin-top: 1000px
          width: 155px;
          height: 40px;
        }

        #church-address {
          float: left;
          margin-top: 0;
          padding-right: 150px;
        }

        #verse {
          display: inline-block;
        }

        #statement-table td {
          padding-top: 10px;
          padding-bottom: 10px;

          border-bottom: 1px solid #ddd;
        }

        th {
          padding-bottom: 10px;

          border-bottom: 1px solid #ddd;

          font-family: "Helvetica";
          font-weight: 700;
        }

        table {
          text-align: left;

          font-family: "Courier New";
          font-size: 12px;
        }

        h7 {
          font-size: 12px;
        }

        .type {
          width: 55%;
        }

        .total {
          color: black;

          font-family: "Helvetica";
          font-size: 18px;
          font-weight: 800;
        }

        .newspring--icon,
        .newspring--icon::after {
          background-color: black;
        }

        .newspring--icon {
          position: absolute;

          margin-top: 200px;
          margin-left: 200px;
        }

        .logo-icon {
          position: absolute;
          right: 0;
          bottom: 0;

          margin: 20px;
        }

        #statement-table {
          padding-top: 20px;
        }

        #statement-table .total td {
          padding-top: 20px;
          padding-bottom: 20px;
        }

        .footer-text {

          width: 6in;
          margin-top: 40px;
          margin-bottom: 100px;

          font-size: 12px;
          font-style: italic;
          line-height: 1.4em;
        }

      `}</style>
    </head>
    <body>
      <div className="container">
        <p>
          <br />
          <br />
          <br />
        </p>
        <img
          id="logo-img"
          src="https://s3.amazonaws.com/ns.images/newspring/icons/newspring-church-logo-black.png"
        />
        <h2
          style={{ fontFamily: "Helvetica" }}
          className="print-subheader soft-sides soft-half-bottom"
        >
          Contribution Statement
        </h2>

        <div className="soft pre-text">
          <p id="church-address">
            NewSpring Church
            <br />
            EIN# 26-4189337 <br />
            PO Box 1407
            <br />
            Anderson, SC 29622 US
          </p>

          <p>
            {person.NickName || person.FirstName} {person.LastName}
            <br />
            {home.Street1}
            <br />
            {home.Street2 && (
              <span>
                {home.Street2}
                <br />
              </span>
            )}
            {home.City} {home.State} {home.PostalCode}
          </p>

          <p id="verse">
            Malachi 3:10 "Bring the whole tithe into the storehouse, that there may be food in my
            house. Test me in this,' says the LORD Almighty, 'and see if I will not throw open the
            floodgates of heaven and pour out so much blessing that you will not have room enough
            for it."
          </p>
        </div>

        <table className="soft" style={{ width: "100%" }} id="statement-table">
          <tbody>
            <tr>
              <th className="type" style={{ fontFamily: "Helvetica", fontWeight: 700 }}>
                Account
              </th>
              <th style={{ fontFamily: "Helvetica", fontWeight: 700 }}>Date</th>
              <th style={{ fontFamily: "Helvetica", fontWeight: 700 }}>Amount</th>
            </tr>
            {transactions.map((transaction, key) => (
              <tr key={key}>
                <td>{transaction.Name}</td>
                <td>{transaction.Date}</td>
                <td>{formatMoney(transaction.Amount)}</td>
              </tr>
            ))}
            <tr className="total" style={{ width: "100%" }}>
              <td className="soft-ends" style={{ fontFamily: "Helvetica" }}>
                Total
              </td>
              <td />
              <td className="soft-ends total-amount" style={{ fontFamily: "Helvetica" }}>
                {formatMoney(total)}
              </td>
            </tr>
          </tbody>
        </table>

        <p className="footer-text soft">
          Thank you for your continued support. Please note that for taxation purposes, no goods or
          services were received in return for these contributions. If you have any questions or
          concerns, please contact us at giving@newspring.cc or 864-965-9990.
        </p>
      </div>
    </body>
  </html>
);

export default props => generatePDF(<Statement {...props} />);

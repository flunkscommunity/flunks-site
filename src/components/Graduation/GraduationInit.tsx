import { MarketplaceIndividualNftDto } from "api/generated";
import { FlunkImage } from "components/CustomMonitor";
import { H3, P } from "components/Typography";
import { useFclTransactionContext } from "contexts/FclTransactionContext";
import { useRef, useState } from "react";
import { Button, Frame, ProgressBar, Toolbar } from "react95";
import { TX_STATUS } from "reducers/TxStatusReducer";
import Typewriter from "typewriter-effect";

interface GraduationInitProps {
  flunk: MarketplaceIndividualNftDto;
}

const GraduationInit: React.FC<GraduationInitProps> = (props) => {
  const { flunk } = props;
  const { executeTx, state } = useFclTransactionContext();
  const [startHack, setStartHack] = useState(false);
  const [endHacking, setEndHacking] = useState(false);
  const [percentage, setPercentage] = useState(0);
  const divOverlayRef = useRef<HTMLDivElement>(null);
  const lowGrade = () => Math.floor(Math.random() * 50) + 1;
  const highGrade = () => Math.floor(Math.random() * 20) + 80;
  const hackTexts = [
    "$ ssh student@schoolserver.edu",
    "student@schoolserver.edu's password:",
    "Last login:&emsp; Fri Dec 08 15:47:59 1995 from 192.168.1.100",
    "<br/>",
    "Welcome to the School District's server",
    "<br/>",
    "* Documentation:&emsp;https://help.schoolserver.edu",
    "* Support:&emsp;&emsp;https://schoolserver.edu/support",
    "<br/>",
    "System information as of Fri Dec 08 15:48:01 1995",
    "",
    "System load:&emsp;  0.0&emsp;                Users logged in:&emsp;     2",
    "Usage of /:&emsp;   21.9% of 19.56GB&emsp;   IP address for ens3: 192.168.1.1",
    "Memory usage:&emsp; 6%                 ",
    "Swap usage:&emsp;   0%",
    "",
    "0 updates can be installed immediately.",
    "0 of these updates are security updates.",
    "",
    "Last login:&emsp; Fri Dec 08 15:47:59 1995 from 192.168.1.100",
    "student@schoolserver:~#",
    "",
    "$ mysql -u student -p",
    "Enter password: ",
    "Welcome to the MySQL monitor.  Commands end with ; or g.",
    "Your MySQL connection id is 8",
    "Server version: 8.0.21 MySQL Community Server - GPL",
    "",
    "Copyright (c) 1995, 2022, Flunks High and/or its affiliates. All rights reserved.",
    "",
    "Type 'help;' or 'h' for help. Type 'c' to clear the current input statement.",
    "",
    "mysql> ",
    "",
    "mysql> use grades;",
    "Reading table information for completion of table and column names",
    "You can turn off this feature to get a quicker startup with -A",
    "",
    "Database changed",
    `mysql> SELECT * FROM students WHERE name='Flunk #${flunk.templateId}';`,
    "+--------+-------+-------+-------+-------+-------+",
    "| name   | math  | science  | history  | english  | average  |",
    "+--------+-------+-------+-------+-------+-------+",
    `| Flunk #${flunk.templateId}  | 50    | 45    | 40    | 35    | 42.5  |`,
    "+--------+-------+-------+-------+-------+-------+",
    "1 row in set (0.00 sec)",
    "",
    `mysql> UPDATE students SET math=95, science=90, history=85, english=80, average=(95+90+85+80)/4 WHERE name='Flunk ${flunk.templateId}';`,
    "Query OK, 1 row affected (0.00 sec)",
    "Rows matched: 1  Changed: 1  Warnings: 0",
    "",
    `mysql> SELECT * FROM students WHERE name='Flunk #${flunk.templateId}';`,
    "+--------+-------+-------+-------+-------+-------+",
    "| name   | math  | science  | history  | english  | average  |",
    "+--------+-------+-------+-------+-------+-------+",
    `| Flunk #${flunk.templateId}  | 95    | 90    | 85    | 80    | 88.75  |`,
    "+--------+-------+-------+-------+-------+-------+",
    "1 row in set (0.00 sec)",
    "",
    "mysql> exit",
    "Bye",
    "student@schoolserver:~# ",
  ];

  const handleLoadFaster = () => {
    if (divOverlayRef.current) {
      const currentHeight =
        divOverlayRef.current.style.getPropertyValue("height");
      const currentHeightNoPercentage = currentHeight.replace("%", "");

      divOverlayRef.current.style.setProperty(
        "height",
        `${Number(currentHeightNoPercentage) - 1}%`
      );

      if (percentage < 100) {
        setPercentage(percentage + 1);
      }
    }
  };

  if (endHacking) {
    return (
      <Frame
        variant="field"
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          overflow: "auto",
          position: "relative",
          gap: ".5rem",
          padding: "1rem",
        }}
      >
        <div
          style={{
            position: "relative",
          }}
        >
          <FlunkImage
            src={`https://storage.googleapis.com/flunk-graduation/graduation/${flunk.templateId}.png`}
            style={{
              width: "100%",
              height: "100%",
              maxWidth: "360px",
              maxHeight: "360px",
            }}
          />

          <div
            ref={divOverlayRef}
            style={{
              position: "absolute",
              bottom: "0",
              left: "0",
              width: "100%",
              height: "100%",
              backgroundColor: "#CCCCCC",
            }}
          />
        </div>

        <H3>Flunk #{flunk.templateId}</H3>

        <P
          style={{
            textAlign: "center",
            marginTop: ".5rem",
            marginBottom: ".5rem",
          }}
        >
          The school server is a little slow, <br /> give it a few minutes...
        </P>

        <div
          style={{
            maxWidth: "360px",
            width: "100%",
          }}
        >
          <ProgressBar value={Math.floor(percentage)} />
        </div>

        <div>
          <Button onClick={handleLoadFaster}>Load FASTER!!!!!</Button>
        </div>
      </Frame>
    );
  }

  return (
    <Frame
      onClick={() => {
        if (true) {
          setEndHacking(true);
        }
      }}
      variant="well"
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: "black",
        display: "flex",
        // terminal green
        color: "#00FF00",
        overflow: "auto",
        position: "relative",
      }}
    >
      {!startHack && (
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setStartHack(true);
          }}
          id="typewriter"
          style={{
            alignSelf: "center",
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Hack Grades
        </Button>
      )}

      {state.txState === TX_STATUS.SUCCESS && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0.5,
            color: "white",
            textAlign: "center",
          }}
        >
          <P>Transaction complete, click anywhere to skip</P>
          <P>or stay for the hacking 🤷</P>
        </div>
      )}

      {startHack && (
        <Typewriter
          onInit={(typewriter) => {
            typewriter
              .changeDelay(25)
              .typeString(hackTexts[0] + "<br/>")
              .typeString(hackTexts[1] + "<br/>")
              .typeString(hackTexts[2] + "<br/>")
              .typeString(hackTexts[3] + "<br/>")
              .typeString(hackTexts[4] + "<br/>")
              .typeString(hackTexts[5] + "<br/>")
              .typeString(hackTexts[6] + "<br/>")
              .typeString(hackTexts[7] + "<br/>")
              .typeString(hackTexts[8] + "<br/>")
              .typeString(hackTexts[9] + "<br/>")
              .typeString(hackTexts[10] + "<br/>")
              .typeString(hackTexts[11] + "<br/>")
              .typeString(hackTexts[12] + "<br/>")
              .typeString(hackTexts[13] + "<br/>")
              .typeString(hackTexts[14] + "<br/>")
              .typeString(hackTexts[15] + "<br/>")
              .typeString(hackTexts[16] + "<br/>")
              .typeString(hackTexts[17] + "<br/>")
              .typeString(hackTexts[18] + "<br/>")
              .typeString(hackTexts[19] + "<br/>")
              .typeString(hackTexts[20] + "<br/>")
              .typeString(hackTexts[21] + "<br/>")
              .typeString(hackTexts[22] + "<br/>")
              .typeString(hackTexts[23] + "<br/>")
              .typeString(hackTexts[24] + "<br/>")
              .typeString(hackTexts[25] + "<br/>")
              .typeString(hackTexts[26] + "<br/>")
              .typeString(hackTexts[27] + "<br/>")
              .typeString(hackTexts[28] + "<br/>")
              .typeString(hackTexts[29] + "<br/>")
              .typeString(hackTexts[30] + "<br/>")
              .typeString(hackTexts[31] + "<br/>")
              .typeString(hackTexts[32] + "<br/>")
              .typeString(hackTexts[33] + "<br/>")
              .typeString(hackTexts[34] + "<br/>")
              .typeString(hackTexts[35] + "<br/>")
              .typeString(hackTexts[36] + "<br/>")
              .typeString(hackTexts[37] + "<br/>")
              .typeString(hackTexts[38] + "<br/>")
              .typeString(hackTexts[39] + "<br/>")
              .typeString(hackTexts[40] + "<br/>")
              .typeString(hackTexts[41] + "<br/>")
              .typeString(hackTexts[42] + "<br/>")
              .typeString(hackTexts[43] + "<br/>")
              .typeString(hackTexts[44] + "<br/>")
              .typeString(hackTexts[45] + "<br/>")
              .typeString(hackTexts[46] + "<br/>")
              .typeString(hackTexts[47] + "<br/>")
              .typeString(hackTexts[48] + "<br/>")
              .typeString(hackTexts[49] + "<br/>")
              .typeString(hackTexts[50] + "<br/>")
              .typeString(hackTexts[51] + "<br/>")
              .typeString(hackTexts[52] + "<br/>")
              .typeString(hackTexts[53] + "<br/>")
              .typeString(hackTexts[54] + "<br/>")
              .typeString(hackTexts[55] + "<br/>")
              .typeString(hackTexts[56] + "<br/>")
              .typeString(hackTexts[57] + "<br/>")
              .typeString(hackTexts[58] + "<br/>")
              .typeString(hackTexts[59] + "<br/>")
              .typeString(hackTexts[60] + "<br/>")
              .typeString(hackTexts[61] + "<br/>")
              .typeString("Click anywhere to continue...")
              .start();
          }}
        />
      )}
    </Frame>
  );
};

export default GraduationInit;

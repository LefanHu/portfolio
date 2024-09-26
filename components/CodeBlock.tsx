import { CodeBlock, atomOneDark } from "react-code-blocks";

export default function SimpleCodelock({
  code,
  language,
  showLineNumbers,
}: {
  code: string;
  language: string;
  showLineNumbers: boolean;
}) {
  return (
    <CodeBlock
      text={code}
      language={language}
      showLineNumbers={showLineNumbers}
      theme={atomOneDark}
      customStyle={{
        height: "250px",
        overflowY: "scroll",
        margin: "0px 0.75rem",
        borderRadius: "5px",
        boxShadow: "1px 2px 3px rgba(0,0,0,0.35)",
        fontSize: "0.75rem",
      }}
      wrapLongLines
    />
  );
}

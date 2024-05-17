import axios from "axios";
import { useEffect, useState } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { useParams } from "react-router-dom";
import { parseISO, format } from "date-fns";
import { IconLoader2 } from "@tabler/icons-react";
import Markdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark as highlightStyle } from "react-syntax-highlighter/dist/esm/styles/prism";
// import SyntaxHighlighter from "react-syntax-highlighter";
// import { atelierLakesideDark as highlightStyle } from "react-syntax-highlighter/dist/esm/styles/hljs";
import remarkGfm from "remark-gfm";

interface Short {
  id: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  description: string;
}

interface CodeProps {
  node?: any;
  inline?: any;
  className?: any;
  children?: any;
}

function Short() {
  const { setActiveNavbarButton } = useStateContext();
  setActiveNavbarButton("dev");

  const [short, setShort] = useState<Short | null>(null);
  const [markdownContent, setMarkdownContent] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    const fetchShort = async () => {
      try {
        const shortResponse = await axios.get(
          `http://127.0.0.1:8000/api/v1/shorts/${id}`,
        );
        console.log(shortResponse.data.data.bodyMdFilepath);
        const mdDataResponse = await axios.get(
          shortResponse.data.data.bodyMdFilepath,
        );
        // console.log(articleResponse.data.data);
        setMarkdownContent(mdDataResponse.data);
        setShort(shortResponse.data.data);
        setIsLoading(false);
      } catch (error) {
        setIsError(true);
        console.log(error);
        setIsLoading(false);
      }
    };

    fetchShort();
  }, []);

  return (
    <div className="flex h-max flex-col pb-24 pt-24">
      {isLoading ? (
        <div className="flex h-full items-center justify-center ">
          <h1 className=" animate-fade-down animate-delay-200 animate-duration-500 animate-ease-out">
            <IconLoader2 className="animate-spin" />
          </h1>
        </div>
      ) : (
        <>
          {isError || short === null ? (
            <>
              <h1 className="animate-fade-down pb-2 text-4xl font-medium animate-duration-500 animate-ease-out">
                Oops..
              </h1>
              <span className="animate-fade-down font-light animate-delay-100 animate-duration-500 animate-ease-out">
                There was an error while fetching the article.
              </span>
            </>
          ) : (
            <>
              <h1 className="animate-fade-down pb-2 text-4xl font-medium animate-duration-500 animate-ease-out">
                {short.title}
              </h1>
              <span className="animate-fade-down font-light animate-delay-100 animate-duration-500 animate-ease-out">
                {short.description}
              </span>
              <span className="animate-fade-down pt-4 font-light animate-delay-200 animate-duration-500 animate-ease-out">
                {format(parseISO(short.createdAt), "dd MMMM yyyy")}
              </span>
              <div className="animate-fade-down pt-8 font-light animate-delay-300 animate-duration-500 animate-ease-out">
                <Markdown
                  className="markdown"
                  children={markdownContent}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ node, className, children, ...props }: CodeProps) {
                      const match = /language-(\w+)/.exec(className || "");
                      return match ? (
                        <div className="">
                          <SyntaxHighlighter
                            children={String(children).replace(/\n$/, "")}
                            PreTag="div"
                            language={match[1]}
                            style={highlightStyle}
                            wrapLongLines
                            showLineNumbers
                            codeTagProps={{
                              style: {
                                fontSize: "inherit",
                                lineHeight: "inherit",
                                fontFamily: "Ubuntu Mono",
                              },
                            }}
                            customStyle={{
                              lineHeight: 1.4,
                              borderRadius: "12px",
                              background: "#25292e",
                            }}
                            {...props}
                          />
                        </div>
                      ) : (
                        <code {...props} className={className}>
                          {children}
                        </code>
                      );
                    },
                    a: (props) => {
                      return (
                        <a
                          className="text-orange-400 underline"
                          href={props.href}
                        >
                          {props.children}
                        </a>
                      );
                    },
                  }}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Short;

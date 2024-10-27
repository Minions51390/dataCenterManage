import React, {useEffect, useRef} from 'react';
import '../../style/pageStyle/StuPaperDetailMore.less'


const BankType = {
    choice: "choice",
    pack: "pack",
    long_reading: "long_reading",
    cf_reading: "cf_reading",
  };
const findAnswerVal = (answer:any, key:any) => {
    if (!key) {
      return;
    }
    return answer.filter((item:any) => {
      return item.key === key;
    })[0];
  }
/** 文章内容type=choice */
const renderSectionChoice = (data:any, card:any, partName:any) => {
    return (
        <div className="sectionChoice">
            <div id={`#${partName}${data.sectionName}`} className="sectionMain">
            <div className="directions">{data.directions}</div>
            <div className="paper">
                ({" "}
                <span
                style={{
                    color: `${
                        (card[0].rightKey ? card[0].rightKey === card[0].choiceKey : true) ? "#0076FF" : "#FF0000"
                    }`,
                    textDecoration: "underline",
                }}
                >
                {card[0].rightKey || card[0].choiceKey}
                </span>{" "}
                ){data.article}
            </div>
            </div>
            <div className="sectionRes">
            {data.answers.map((item:any) => {
                return (
                <div
                    className="answer"
                    style={
                    card[0].choiceKey === item.key
                        ? {
                            color: "#0076FF",
                            textDecoration: "underline",
                        }
                        : card[0].rightKey === item.key
                        ? {
                            color: "#FF0000",
                            textDecoration: "underline",
                        }
                        : {}
                    }
                >
                    <span style={{ marginRight: "8px" }}>{item.key})</span>
                    {item.value}
                </div>
                );
            })}
            </div>
        </div>
    );
}
/** 文章内容type=pack 阅读理解 */
const renderSectionTypeOne = (data:any, card:any, partName:any) => {
    let answersMap = data.answers;

    let article = data.article;

    card.forEach((item:any) => {
        const finVal = findAnswerVal(
            answersMap,
            item.rightKey || item.choiceKey
        );
        const right = item.rightKey ? item.choiceKey === item.rightKey : true;
        if (finVal) {
            article = article.replace(
            `__${item.index}__`,
            `( <span style="color: ${
                right ? "#0076FF" : "#FF0000"
            }; text-decoration: underline;">${finVal.value}</span> )`
            );
        }
    });

    return (
        <div className="sectionBlock">
            <div className="sectionMain">
                <div id={`#${partName}${data.sectionName}`} className="title">
                    {data.sectionName}
                </div>
                <div className="directions">
                    <b>Directions: </b>ln this section, there is a passage with several
                    blanks. You are required to select one word for eachblank from a
                    list of choices given in a word bank following the passage. Read the
                    passage through carefully beforemaking your choices. Each choice in
                    the bank is identified by a lefter.{" "}
                    <b>You may not use any of the words in thebank more than once.</b>
                </div>
                <div className="paper" dangerouslySetInnerHTML={{ __html: article }} /></div>
                <div className="sectionRes">
                <div className="sectionPos">
                    {data.answers.map((item:any) => {
                        return (
                            <div className="answer">{`${item.key}）${item.value}`}</div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

/** 文章内容type=cf_reading 仔细阅读 */
const renderSectionTypeTwo = (data:any, card:any, partName:any) => {
    return (
        <div className="sectionBlock">
            <div className="sectionMain">
                <div id={`#${partName}${data.sectionName}`} className="title">
                    {data.sectionName}
                </div>
                <div className="directions">
                    <b>Directions: </b>There are several passages in this section. Each
                    passage is followed by some questions or unfinishedstatements For
                    each of them there are four choices marked A. B. C and D. You should
                    decide on the bestchoice.
                </div>
                <div className="paper">{data.article}</div>
            </div>
            <div className="sectionRes">
                <div className="sectionPos">
                    {data.questions.map((item:any, index:any) => {
                        return (
                            <div key={index}>
                                <div className="question">
                                    ({" "}
                                    <span
                                    style={{
                                        color: `${
                                            (card[index].rightKey ? card[index].rightKey === card[index].choiceKey : true)
                                            ? "#0076FF"
                                            : "#FF0000"
                                        }`,
                                        textDecoration: "underline",
                                    }}
                                    >
                                    {card[index].rightKey || card[index].choiceKey}
                                    </span>{" "}
                                    ){item.question}
                                </div>
                                <div className="questionAnswer">
                                    {item.answers.map((value:any, number:any) => {
                                    return (
                                        <div
                                        key={number}
                                        className="answerItem"
                                        style={
                                            card[index].choiceKey === value.key
                                            ? {
                                                color: "#0076FF",
                                                textDecoration: "underline",
                                                }
                                            : card[index].rightKey === value.key
                                            ? {
                                                color: "#FF0000",
                                                textDecoration: "underline",
                                                }
                                            : {}
                                        }
                                        >{`${value.key}）${value.value}`}</div>
                                    );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

  /** 文章内容type=long_reading 长篇阅读*/
const renderSectionTypeThree = (data:any, card:any, partName:any) => {
    return (
        <div className="sectionBlock">
            <div className="sectionMain">
                <div id={`#${partName}${data.sectionName}`} className="title">
                    {data.sectionName}
                </div>
                <div className="directions">
                    <b>Directions: </b>In this section， you are going to read a passage
                    with ten statements attached to it.Each statement contains
                    information given in one of the paragraphs.Identify the paragraph
                    from which the information is derived. You may choose a paragraph
                    more than once.Each paragraph is marked with a letter.Answer the
                    questions by marking the corresponding letter on{" "}
                    <b>Answer Sheet.</b>
                </div>
                <div className="paper">
                    {data.answers.map((item:any, index:any) => {
                        return (
                            <div className="answer">{`${item.key}）${item.value}`}</div>
                        );
                    })}
                </div>
             </div>
            <div className="sectionRes">
                <div className="sectionPos">
                    {data.questions.map((item:any, index:any) => {
                        return (
                            <div key={index} className="answer">
                                ({" "}
                                    <span
                                        style={{
                                        color: `${
                                            (card[index]?.rightKey ? card[index]?.rightKey === card[index]?.choiceKey : true)
                                            ? "#0076FF"
                                            : "#FF0000"
                                        }`,
                                        textDecoration: "underline",
                                        }}
                                    >
                                        {card[index]?.rightKey || card[index]?.choiceKey}
                                    </span>{" "}
                                ){item}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
const renderFinishRes = (paperData:any) => {
    const {card, score, topPos} = paperData
    return (
      <>
        <div
          className="card"
          style={{ top: `${topPos > 68 ? "68px" : 148 - topPos}px` }}
        >
          <div className="headCon">
            <div className="score">
              考试成绩:<span>{score}</span>
            </div>
          </div>
          <div className="headTips">
            <div className="text">序号</div>
            <div className="text">学生答案</div>
            <div className="text">正确答案</div>
          </div>
          <div className="contentBlock">
            {card.map((item:any, index:any) => {
              return (
                <div key={index} className="itemBlock padding0">
                  {item.map((val:any, num:any) => {
                    return (
                      <div
                        key={num}
                        className="blockLine blockLineFinish"
                        style={{
                          backgroundColor: `${
                            val.choiceKey !== val.rightKey ? "#FFF0F0" : "#FFF"
                          }`,
                        }}
                      >
                        <div
                          className="lineAns"
                          style={{ color: "#C3E2D5", fontWeight: 400 }}
                        >
                          {val.index}
                        </div>
                        <div
                          className="lineAns"
                          style={{
                            color:
                              val.rightKey === val.choiceKey
                                ? "#000"
                                : "#FF0000",
                          }}
                        >
                          {val.choiceKey}
                        </div>
                        <div className="lineAns">{val.rightKey}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
}
const StuPaperDetailMore = (props: any) => {
    const {card, part, scrollToIndex} = props
    const sectionRef = useRef(null);
    const computedSection = (part:any, index:any) => {
        let res = 0;
        for (let i = 0; i < index; i++) {
            res += part[i].section.length
        }
        return res
    }
    console.log('sectionRefout', sectionRef.current)
    useEffect(() => {
        console.log('scrollToIndex', scrollToIndex)
        console.log('sectionRefin', sectionRef.current)
    }, [scrollToIndex]);
    return (
        <div className="stu-paper-detail-more">
            <div className = "main">
                {part.map((item:any, index:any) => {
                    return (
                        <div className="mainItem">
                            <div className="titleBlock">
                                <div id={`#${item.partName}`} className="name">
                                    {item.partName}
                                </div>
                                <div className="title">{item.title}</div>
                            </div>
                            <div className="section" ref={sectionRef} >
                                {
                                    item.section.map((data:any, sectionIndex:any) => {
                                        if (data.type === BankType["pack"]) {
                                            return renderSectionTypeOne(
                                                    data,
                                                    card[computedSection(part, index) + sectionIndex],
                                                    item.partName
                                                );
                                        } else if (data.type === BankType["cf_reading"]) {
                                            return renderSectionTypeTwo(
                                                    data,
                                                    card[computedSection(part, index) + sectionIndex],
                                                    item.partName
                                                );
                                        } else if (data.type === BankType["long_reading"]) {
                                            return renderSectionTypeThree(
                                                data,
                                                card[computedSection(part, index) + sectionIndex],
                                                item.partName
                                            );
                                        } else {
                                            return renderSectionChoice(
                                                data,
                                                card[computedSection(part, index) + sectionIndex],
                                                item.partName
                                            );
                                        }
                                    })
                                }
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="response">
                {renderFinishRes(props)}
          </div>
        </div>
    );
};
export default StuPaperDetailMore;


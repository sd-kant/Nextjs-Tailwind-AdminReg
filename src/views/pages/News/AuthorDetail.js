import React, {useRef} from "react";
import {Link, useNavigate} from "react-router-dom";
import clsx from "clsx";
import style from "./Detail.module.scss";

import Sidebar from "./NewsSidebar"
import {getParamFromUrl} from "../../../utils";
import {NewsProvider, useNewsContext} from "../../../providers/NewsProvider";

export const QueryResult = () => {
  const {
    authorNews,
  } = useNewsContext();

  const refScroll = useRef(null);
  const navigate = useNavigate();
  let id = getParamFromUrl('id');

  const onTopScroll = () => {
    refScroll.current.scrollIntoView({behavior: "smooth"});
  };

  const onPageLink = (page) => {
    if (page === 1) {
      navigate(`/news/author?id=${id}`);
    } else {
      navigate(`/news/author?id=${id}&page=${page}`);
    }

    onTopScroll();
  };

  return (
      <div className={clsx(style.DetailBody)} ref={refScroll}>
        <div className={clsx(style.EtPbContainer)}>
          <div className={clsx(style.Grid2)}>
            <div className={clsx(style.Contents)}>
              {
                authorNews?.posts?.map((item, key) => {
                  return (
                      <div key={key} style={{marginBottom: 80}}>
                        <div className={clsx(style.TitleTxt)}>
                          {item?.title ?? ''}
                        </div>
                        <div className={clsx(style.AuthorTxt)}>
                          {
                            item?.authorName && (
                                <Link to={'/news/author?id=' + (id ?? '')}>by {item?.authorName ?? ''}</Link>
                            )
                          }

                          {
                            item?.date && (
                                <>
                                  &nbsp; | &nbsp; {new Date(item?.date).toLocaleString("en-US", { year: "numeric", month: "short", day: "2-digit"})}
                                </>
                            )
                          }

                          {
                            item?.categoryNames && (
                                <Link to={'/news/author?id=' + (id ?? '')}> &nbsp; | &nbsp;{item?.categoryNames ?? ''}</Link>
                            )
                          }
                        </div>
                        {
                          item?.content && (
                              <div className={clsx(style.NewsContainer)} dangerouslySetInnerHTML={{__html: item?.content}} />
                          )
                        }
                      </div>
                  )
                })
              }

              <div className={clsx(style.PaginationBtnBody)}>
                {
                  authorNews?.pagination?.page !== authorNews?.pagination?.pageCount ?
                      <div onClick={() => onPageLink(authorNews?.pagination?.page + 1)}>« Older Entries</div>
                      :
                      <div />
                }

                {
                  authorNews?.pagination?.page !== 1 && (
                      <div onClick={() => onPageLink(authorNews?.pagination?.page - 1)}>Next Entries »</div>
                  )
                }
              </div>
            </div>

            <Sidebar />
          </div>
        </div>
      </div>
  )
};

const AuthorDetail = ({
  setLoading,
}) => {
  return (
      <div className={clsx(style.Wrapper)}>
        <NewsProvider
            setLoading={setLoading}
        >
          <QueryResult/>
        </NewsProvider>
      </div>
  )
};
export default AuthorDetail;
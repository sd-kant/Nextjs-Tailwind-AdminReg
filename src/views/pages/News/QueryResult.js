import * as React from "react";
import {connect} from "react-redux";

import clsx from "clsx";
import style from "./QueryResult.module.scss";
import {useNewsContext} from "../../../providers/NewsProvider";
import {useLocation, useNavigate} from "react-router";
import {useWidthContext} from "../../../providers/WidthProvider";
import {Link} from "react-router-dom";

const QueryResult = () => {
  const {
    data,
  } = useNewsContext();
  const navigate = useNavigate();
  const location = useLocation();
  const {width} = useWidthContext();

  const list = React.useMemo(() => {
    if (!width || !data?.posts?.length) return [];

    let _list = [...data?.posts];

    if (width >= 992) {
      let splitLen = Math.floor(_list?.length / 3);
      let firstIndex = splitLen + (_list?.length / 3 === splitLen ? 0 : 1);
      let secondIndex = _list?.length - splitLen;

      return [
        _list.slice(0, firstIndex),
        _list.slice(firstIndex, secondIndex),
        _list.slice(secondIndex, )
      ];
    } else if (width >= 600) {
      let splitLen = Math.floor(_list?.length / 2);

      return [
        _list.slice(0, _list?.length - splitLen),
        _list.slice(_list?.length - splitLen,)
      ];
    } else {
      return [_list];
    }
  }, [width, data?.posts]);

  const onPageLink = (page) => {
    if (page === 1) {
      navigate(location?.pathname);
    } else {
      // todo encodeURIComponent
      navigate(`${location?.pathname}?page=${page}`);
    }
  };

  return (
      <div className={clsx(style.Wrapper)}>
        <div className="">
          <div className={clsx(style.CenterWrapper)}>
            <div className={clsx(style.NewsBody)}>
              <div className={clsx(style.Contents)}>
                <div className={clsx(style.Grid3)}>
                  {
                    list?.map((item, key) => {
                      return (
                          <div key={key}>
                            {
                              item?.map((subItem, index) => {
                                return (
                                    <div key={key + '_' + index} className={clsx(style.ItemContents)}>
                                      {
                                        subItem?.thumbnail && (
                                            <Link to={'/news/detail?id=' + subItem?.id}>
                                              <img src={subItem?.thumbnail} className={clsx(style.ImgW)} alt="news img" />
                                            </Link>
                                        )
                                      }
                                      <div className={clsx(style.TxtContainer)}>
                                        <Link to={'/news/detail?id=' + subItem?.id}>
                                          <div className={clsx(style.TitleTxt)}>
                                            {subItem?.title ?? ''}
                                          </div>
                                        </Link>

                                        <div className={clsx(style.MetaTxt)}>
                                          by
                                          <Link to={'/news/author?id=' + subItem?.authorId}>
                                            {subItem?.authorName ?? ''}
                                          </Link>
                                          | {subItem?.date ? (new Date(subItem?.date)).toLocaleString("en-US", { year: "numeric", month: "short", day: "2-digit"}) : ''}
                                        </div>

                                        <Link to={'/news/detail?id=' + subItem?.id}>
                                          <div className={clsx(style.ReadMore)}>
                                            READ MORE
                                          </div>
                                        </Link>
                                      </div>
                                    </div>
                                )
                              })
                            }
                          </div>
                      )
                    })
                  }
                </div>

                {
                  data?.posts?.length ?
                      <div className={clsx(style.PaginationBtnBody)}>
                        {
                          data?.pagination?.page !== data?.pagination?.pageCount ?
                              <div onClick={() => onPageLink(data?.pagination?.page + 1)}>« Older Entries</div>
                              :
                              <div />
                        }

                        {
                          data?.pagination?.page !== 1 && (
                              <div onClick={() => onPageLink(data?.pagination?.page - 1)}>Next Entries »</div>
                          )
                        }
                      </div>
                      :
                      <></>
                }
              </div>
            </div>
          </div>
        </div>
      </div>
  )
};

const mapStateToProps = () => ({});

export default connect(
    mapStateToProps,
    null
)(QueryResult);

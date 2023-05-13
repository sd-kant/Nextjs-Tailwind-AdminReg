import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import style from './Detail.module.scss';
import Sidebar from './NewsSidebar';
import { NewsProvider, useNewsContext } from '../../../providers/NewsProvider';

export const QueryResult = () => {
  const { newsDetail } = useNewsContext();

  return (
    <div className={clsx(style.DetailBody)}>
      <div className={clsx(style.EtPbContainer)}>
        <div className={clsx(style.Grid2)}>
          <div className={clsx(style.Contents)}>
            <div className={clsx(style.TitleTxt)}>{newsDetail?.title ?? ''}</div>
            <div className={clsx(style.AuthorTxt)}>
              {newsDetail?.authorName && (
                <Link to={'/news/author?id=' + (newsDetail?.authorId ?? '')}>
                  by {newsDetail?.authorName ?? ''}
                </Link>
              )}

              {newsDetail?.date && (
                <>
                  &nbsp; | &nbsp;{' '}
                  {new Date(newsDetail?.date).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: '2-digit'
                  })}
                </>
              )}

              {newsDetail?.categoryNames && (
                <Link to={'/news/author?id=' + (newsDetail?.authorId ?? '')}>
                  {' '}
                  &nbsp; | &nbsp;{newsDetail?.categoryNames ?? ''}
                </Link>
              )}
            </div>
            {newsDetail?.thumbnail && (
              <img
                src={newsDetail?.thumbnail}
                className={clsx(style.ThumbnailImg)}
                alt="thumbnail"
              />
            )}
            {newsDetail?.content && (
              <div
                className={clsx(style.NewsContainer)}
                dangerouslySetInnerHTML={{ __html: newsDetail?.content }}
              />
            )}
          </div>

          <Sidebar />
        </div>
      </div>
    </div>
  );
};

const NewsDetail = ({ setLoading }) => {
  return (
    <div className={clsx(style.Wrapper)}>
      <NewsProvider setLoading={setLoading}>
        <QueryResult />
      </NewsProvider>
    </div>
  );
};
export default NewsDetail;

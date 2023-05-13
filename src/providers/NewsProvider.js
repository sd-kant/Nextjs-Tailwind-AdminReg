import * as React from 'react';
import { useLocation } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { withTranslation } from 'react-i18next';
import { get } from 'lodash';

import { setLoadingAction } from '../redux/action/ui';
import {
  queryCategories,
  queryNewsBlog,
  queryNewsBlogDetail,
  queryNewsBlogPerAuthor
} from '../http/cms';
import { NEWS_PAGINATION, NEWS_RECENT_PAGINATION } from '../constant';
import { JoinStringFromArr } from '../utils/news';
import { getParamFromUrl } from '../utils';

const NewsContext = React.createContext(null);

const NewsProviderDraft = ({ children, setLoading }) => {
  const location = useLocation();

  const [newsDetail, setNewsDetail] = React.useState('');
  const [authorNews, setAuthorNews] = React.useState(null);
  const [data, _setData] = React.useState(null);
  const dataRef = React.useRef(data);
  const setData = (v) => {
    _setData(v);
    dataRef.current = v;
  };

  const [keyword, setKeyword] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');

  const page = getParamFromUrl('page') || 1;
  const id = getParamFromUrl('id');

  React.useEffect(() => {
    const promises = [
      queryCategories(),
      queryNewsBlog(
        keyword,
        location?.pathname === '/news' ? page : 1,
        categoryId ? NEWS_RECENT_PAGINATION : NEWS_PAGINATION,
        categoryId
      )
    ];

    setLoading(true);
    const a = () =>
      new Promise((resolve) => {
        Promise.allSettled(promises)
          .then((results) => {
            results?.forEach((result, index) => {
              if (result.status === `fulfilled`) {
                if (index === 0) {
                  setData({
                    ...dataRef.current,
                    categories:
                      result.value?.data?.data?.map((it) => ({
                        id: it?.id ?? '',
                        name: it?.attributes?.name ?? ''
                      })) ?? []
                  });
                } else if (index === 1) {
                  setData({
                    ...dataRef.current,
                    posts:
                      result.value?.data?.data?.map((it) => ({
                        id: it?.id ?? '',
                        authorId: `${it?.attributes?.admin_user?.data?.id ?? ''}`,
                        categoryNames: JoinStringFromArr(it?.attributes?.categories?.data ?? []),
                        title: it?.attributes?.title ?? '',
                        date: it?.attributes?.date ?? '',
                        updatedAt: it?.attributes?.updatedAt ?? '',
                        content: it?.attributes?.content ?? '',
                        thumbnail: it?.attributes?.thumbnail?.data?.attributes?.url ?? '',
                        authorName: `${
                          it?.attributes?.admin_user?.data?.attributes?.firstname ?? ''
                        }`
                      })) ?? [],
                    pagination: result.value?.data?.meta?.pagination ?? {}
                  });
                }
              }
            });
          })
          .catch((e) => console.log(e.toString()))
          .finally(() => {
            resolve();
            setLoading(false);
          });
      });
    Promise.allSettled([a()]).then();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, categoryId, keyword]);

  React.useEffect(() => {
    if (id) {
      setLoading(true);
      queryNewsBlogDetail(id)
        .then((res) => {
          let detail = {};
          if (res.data?.data?.length > 0) {
            detail = res.data?.data[0];
          }
          setNewsDetail({
            id: detail?.id ?? '',
            authorId: `${detail?.attributes?.admin_user?.data?.id ?? ''}`,
            categoryNames: JoinStringFromArr(detail?.attributes?.categories?.data ?? []),
            title: detail?.attributes?.title ?? '',
            date: detail?.attributes?.date ?? '',
            updatedAt: detail?.attributes?.updatedAt ?? '',
            content: detail?.attributes?.content ?? '',
            thumbnail: detail?.attributes?.thumbnail?.data?.attributes?.url ?? '',
            authorName: `${detail?.attributes?.admin_user?.data?.attributes?.firstname ?? ''}`
          });
        })
        .catch((e) => {
          console.error('getting news Detail error', e);
        })
        .finally(() => {
          setLoading(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  /**
   * News List per author
   */
  React.useEffect(() => {
    if (location?.pathname === '/news/author') {
      if (!setAuthorNews) setAuthorNews({});
      else {
        setLoading(true);
        queryNewsBlogPerAuthor(page, NEWS_RECENT_PAGINATION, id)
          .then((res) => {
            setAuthorNews({
              posts:
                res.data?.data?.map((it) => ({
                  id: it?.id ?? '',
                  authorId: `${it?.attributes?.admin_user?.data?.id ?? ''}`,
                  categoryNames: JoinStringFromArr(it?.attributes?.categories?.data ?? []),
                  title: it?.attributes?.title ?? '',
                  date: it?.attributes?.date ?? '',
                  updatedAt: it?.attributes?.updatedAt ?? '',
                  content: it?.attributes?.content ?? '',
                  thumbnail: it?.attributes?.thumbnail?.data?.attributes?.url ?? '',
                  authorName: `${it?.attributes?.admin_user?.data?.attributes?.firstname ?? ''}`
                })) ?? [],
              pagination: res.data?.meta?.pagination ?? {}
            });
          })
          .catch((e) => {
            console.error('getting news Detail error', e);
          })
          .finally(() => {
            setLoading(false);
          });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, location?.pathname, id]);

  const providerValue = {
    setLoading,
    page,
    keyword,
    setKeyword,
    data,
    newsDetail,
    authorNews,
    categoryId,
    setCategoryId
  };

  return <NewsContext.Provider value={providerValue}>{children}</NewsContext.Provider>;
};

const mapStateToProps = (state) => ({
  userType: get(state, 'auth.userType')
});

const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      setLoading: setLoadingAction
    },
    dispatch
  );

export const NewsProvider = connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(NewsProviderDraft));

export const useNewsContext = () => {
  const context = React.useContext(NewsContext);
  if (!context) {
    throw new Error('useNewsContext must be used within NewsProvider');
  }
  return context;
};

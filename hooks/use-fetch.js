import { useState } from "react";
import { toast } from "sonner";

/**
 * 于封装和管理异步请求（如 API 调用）的常见状态（数据、加载、错误）。
 * 通过统一处理这些状态，可以减少组件中的重复代码，提升开发效率。
 *      data：请求成功后的响应数据。
 *      loading：请求是否正在进行中（布尔值）。
 *      error：请求失败时的错误信息。
 *      fn：触发异步请求的函数。
 *      setData：手动修改 data 的方法（类似 useState 的 setter）。
 */
const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fn = async (...args) => {
    setLoading(true);
    setError(null);

    try {
      const response = await cb(...args);
      setData(response);
      setError(null);
    } catch (error) {
      setError(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn, setData };
};

export default useFetch;

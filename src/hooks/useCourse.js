import { useEffect, useState } from 'react';
import { fetchCatalog, fetchCourse, fetchAllCourses, fetchPaths } from '../api/client';

/** Loads a course document. Mirrors how a real request will behave. */
export function useCourse(courseId) {
  const [state, setState] = useState({ status: 'loading', course: null, error: null });

  useEffect(() => {
    let active = true;
    setState({ status: 'loading', course: null, error: null });
    fetchCourse(courseId)
      .then((course) => active && setState({ status: 'ready', course, error: null }))
      .catch((error) => active && setState({ status: 'error', course: null, error }));
    return () => {
      active = false;
    };
  }, [courseId]);

  return state;
}

export function useCatalog() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    let active = true;
    fetchCatalog().then((list) => active && setCourses(list));
    return () => {
      active = false;
    };
  }, []);

  return courses;
}

export function useAllCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    let active = true;
    fetchAllCourses().then((list) => active && setCourses(list));
    return () => {
      active = false;
    };
  }, []);

  return courses;
}

export function usePaths() {
  const [paths, setPaths] = useState([]);

  useEffect(() => {
    let active = true;
    fetchPaths().then((list) => active && setPaths(list));
    return () => {
      active = false;
    };
  }, []);

  return paths;
}

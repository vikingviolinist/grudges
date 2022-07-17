import React, { createContext, useCallback, useReducer } from 'react';

import id from 'uuid/v4';
import initialState from './initialState';

export const GrudgeContext = createContext();

const GRUDGE_ADD = 'GRUDGE_ADD';
const GRUDGE_FORGIVE = 'GRUDGE_FORGIVE';
const UNDO = 'UNDO';
const REDO = 'REDO';

const useUndoReducer = (reducer, initialState) => {
  const undoState = {
    past: [],
    present: initialState,
    future: []
  };

  const undoReducer = (state, action) => {
    const newPresent = reducer(state.present, action);

    switch (action.type) {
      case UNDO:
        const [newPresentUndo, ...newPastUndo] = state.past;
        return {
          past: newPastUndo,
          present: newPresentUndo,
          future: [state.present, ...state.future]
        };
      case REDO:
        const [newPresentRedo, ...newFutureRedo] = state.past;
        console.log(newPresentRedo);

        return {
          past: [state.present, ...state.past],
          present: newPresentRedo,
          future: newFutureRedo
        };
      default:
        return {
          past: [state.present, ...state.past],
          present: newPresent,
          future: []
        };
    }
  };

  return useReducer(undoReducer, undoState);
};

const reducer = (state = initialState, action) => {
  switch (action.type) {
    case GRUDGE_ADD:
      return [{ id: id(), ...action.payload }, ...state];
    case GRUDGE_FORGIVE:
      return state.map((grudge) => {
        if (grudge.id !== action.payload.id) return grudge;
        return { ...grudge, forgiven: !grudge.forgiven };
      });

    default:
      return state;
  }
};

const GrudgeProvider = ({ children }) => {
  const [state, dispatch] = useUndoReducer(reducer, initialState);
  // console.log(state);
  const grudges = state.present;
  const isPast = !!state.past.length;
  const isFuture = !!state.future.length;

  const addGrudge = useCallback(
    ({ person, reason }) => {
      dispatch({
        type: GRUDGE_ADD,
        payload: {
          id: id(),
          person,
          reason,
          forgiven: false
        }
      });
    },
    [dispatch]
  );

  const toggleForgiveness = useCallback(
    (id) => {
      dispatch({
        type: GRUDGE_FORGIVE,
        payload: { id }
      });
    },
    [dispatch]
  );

  const undo = useCallback(() => {
    dispatch({ type: 'UNDO' });
  }, [dispatch]);

  const redo = useCallback(() => {
    dispatch({ type: 'REDO' });
  }, [dispatch]);

  const value = {
    grudges,
    addGrudge,
    toggleForgiveness,
    isPast,
    isFuture,
    undo,
    redo
  };

  return (
    <GrudgeContext.Provider value={value}>{children}</GrudgeContext.Provider>
  );
};

export default GrudgeProvider;

// src/hooks/useNotification.js

import { useContext } from 'react';
import { NotificationContext } from '../context/context';

export const useNotification = () => {
  return useContext(NotificationContext);
};
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { get as getItem, set as setItem, del as removeItem } from "idb-keyval";

export default createAsyncStoragePersister({
  storage: { getItem, setItem, removeItem }
});
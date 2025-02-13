import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
// import { string } from 'prop-types';
// import useFetch from "react-fetch-hook"

interface TaxonomyItem {
  id?: string;
  text: string;
  children: string[];
};

type TaxonomyList = TaxonomyItem[];

type TaxonomyDataContextType = {
  issuesMap: Map<string, string[]>;
  priorityAreasMap: Map<string, string[]>;
  isTaxonomyError: boolean;
};

const TaxonomyDataContext = createContext<TaxonomyDataContextType>({
  issuesMap: new Map<string, string[]>(),
  priorityAreasMap: new Map<string, string[]>(),
  isTaxonomyError: false
});

const { Provider, Consumer } = TaxonomyDataContext;

const TaxonomyDataContextProvider = ({
  children: childNodes,
}: {
  children: JSX.Element;
}) => {
  const [issuesMap, setIssuesMap] = useState<Map<string, string[]>>(new Map());
  const [priorityAreasMap, setPriorityAreasMap] = useState<Map<string, string[]>>(new Map());
  const [isTaxonomyError, setIsTaxonomyError] = useState(false);

  // for a more generic and perhaps performing setup
  // get all taxonomies with ONE api call and split it in this component

  useEffect(() => {
    const getData = async () => {

      try {
        const issues_resp = await axios.get(`https://api.taxonomy.sandbox.k8s.brigade.cloud/taxonomy?category=Issues`)
        const issues = issues_resp.data;
        // only take the children of the first object, this is the detailed list of taxonomy items

        const taxonomyIssues: TaxonomyList = issues[0].children;
        const issuesMapLocal = new Map<string, string[]>
          (taxonomyIssues.filter(key => key.children).map(key => [key.text, key.children]));
        setIssuesMap(issuesMapLocal);
      }
      catch (error) {
        setIsTaxonomyError(true);
      };

      try {
        const paa_resp = await axios.get(`https://api.taxonomy.sandbox.k8s.brigade.cloud/taxonomy?category=Priority-Action-Areas`);
        const _paa_data = paa_resp.data
        const priorityAreas = _paa_data;

        // only take the children of the first object, this is the detailed list of taxonomy items
        const taxonomyPriorityAreas: TaxonomyList = priorityAreas[0].children;
        const priorityAreasMapLocal = new Map<string, string[]>
          (taxonomyPriorityAreas.filter(key => key.children).map(key => [key.text, key.children]));
        setPriorityAreasMap(priorityAreasMapLocal);
      }
      catch (error) {
        setIsTaxonomyError(true);
      }
    }
    getData();
    // Disabling bc data length isn't going to change outside of this hook
    // eslint-disable-next-line
  }, []);

  return (
    <Provider
      value={{
        issuesMap: issuesMap,
        priorityAreasMap: priorityAreasMap,
        isTaxonomyError: isTaxonomyError
      }}
    >
      {childNodes}
    </Provider>
  );
};

export { TaxonomyDataContextProvider };
export { Consumer as TaxonomyDataConsumer };
export default TaxonomyDataContext;
import React from 'react';
import { PlatformStateContext, NerdGraphQuery, NrqlQuery, QueryGroup, Spinner, HeadingText, Grid, GridItem, Stack, StackItem, BillboardChart, LineChart } from 'nr1'
import {CalculateCompositeApdex, CalculateCompositeApdexTimeseries, CombineQueryDataResults} from './utils/utils'


// https://docs.newrelic.com/docs/new-relic-programmable-platform-introduction

export default class CompositeApdex extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            queryAccountIds: [/*add in account ids in a comma separated list*/ ],
        }
    }

    render() {
        const {queryAccountIds} = this.state;
        console.log({queryAccountIds});

        // Nerdgraph queries

        const mycontrol4Query1 = `
        query($masterActId: Int!){
            actor {
              account(id: $masterActId) {
                nrql(query: "SELECT apdex(apm.service.apdex) as 'my.control4.com' FROM Metric WHERE appName IN ('mydot-container','services','connectionmanager','weather','admin-service','cmauth', 'sunbritetv.com') SINCE 1 month ago FACET appName") {
                  results
                }
              }
            }
          }
          `;

          const mycontrol4Query2 = `
          query($webSvcActId: Int!){
            actor {
              account(id: $webSvcActId) {
                nrql(query: "SELECT apdex(apm.service.apdex) as 'my.control4.com' FROM Metric WHERE appName IN ('mydot-container','services','connectionmanager','weather','admin-service','cmauth', 'sunbritetv.com') SINCE 1 month ago FACET appName") {
                  results
                }
              }
            }
          }
          `;

          const mycontrol4TimeseriesQuery1 = `
          query($masterActId: Int!){
              actor {
                account(id: $masterActId) {
                  nrql(query: "SELECT apdex(apm.service.apdex) as 'my.control4.com' FROM Metric WHERE appName IN ('mydot-container','services','connectionmanager','weather','admin-service','cmauth', 'sunbritetv.com') SINCE 6 hours ago FACET appName TIMESERIES") {
                    results
                  }
                }
              }
            }
            `;

          const mycontrol4TimeseriesQuery2 = `
          query($webSvcActId: Int!){
              actor {
                account(id: $webSvcActId) {
                  nrql(query: "SELECT apdex(apm.service.apdex) as 'my.control4.com' FROM Metric WHERE appName IN ('mydot-container','services','connectionmanager','weather','admin-service','cmauth', 'sunbritetv.com') SINCE 6 hours ago FACET appName TIMESERIES") {
                    results
                  }
                }
              }
            }
            `;

          const overallMasterActQuery = `
        query($masterActId: Int!){
            actor {
              account(id: $masterActId) {
                nrql(query: "SELECT apdex(apm.service.apdex) as 'Overall' FROM Metric WHERE appName LIKE '%' SINCE 1 month ago FACET appName LIMIT MAX") {
                  results
                }
              }
            }
          }
          `;

          const overallwebSvcActQuery = `
        query($webSvcActId: Int!){
            actor {
              account(id: $webSvcActId) {
                nrql(query: "SELECT apdex(apm.service.apdex) as 'Overall' FROM Metric WHERE appName LIKE '%' SINCE 1 month ago FACET appName LIMIT MAX") {
                  results
                }
              }
            }
          }
          `;

          const overallovrcActQuery = `
        query($ovrcActId: Int!){
            actor {
              account(id: $ovrcActId) {
                nrql(query: "SELECT apdex(apm.service.apdex) as 'Overall' FROM Metric WHERE appName LIKE '%' SINCE 1 month ago FACET appName LIMIT MAX") {
                  results
                }
              }
            }
          }
          `;

          // Variables for the Nerdgraph queries, Add in the the required account ids

          const variables = {
            webSvcActId: 0,
            masterActId: 0,
            ovrcActId: 0
          };

        return (
            
            <Stack
                fullWidth
                horizontalType={Stack.HORIZONTAL_TYPE.FILL}
                gapType={Stack.GAP_TYPE.EXTRA_LOOSE}
                spacingType={[Stack.SPACING_TYPE.MEDIUM]}
                directionType={Stack.DIRECTION_TYPE.VERTICAL}>

                <StackItem>
                <hr />
                    <PlatformStateContext.Consumer>
                    {(PlatformState) => {
                        /* Taking a peek at the PlatformState */
                        return (
                        <>
                            <Grid
                            className="primary-grid"
                            spacingType={[Grid.SPACING_TYPE.NONE, Grid.SPACING_TYPE.NONE]}
                            >

                                <GridItem className="primary-content-container" columnSpan={6}>
                                    <main className="primary-content full-height">
                                    <HeadingText spacingType={[HeadingText.SPACING_TYPE.MEDIUM]} type={HeadingText.TYPE.HEADING_4}>
                                        Composite Apdex NerdGraph my.constrol4.com
                                    </HeadingText>
                                        <QueryGroup>
                                        <NerdGraphQuery query={mycontrol4Query1} variables={variables} />
                                        <NerdGraphQuery query={mycontrol4Query2} variables={variables} />
                                            {(query1, query2) => {
                                                if (query1.loading || query2.loading) {
                                                    return <Spinner />;
                                                }

                                                if (query1.error || query2.error) {
                                                    console.log("Query1 Error", query1.error, "Query2 Error", query2.error);
                                                    return 'Error!';
                                                }
                                                
                                                const combineData = CombineQueryDataResults(query1.data.actor.account.nrql.results, query2.data.actor.account.nrql.results)
                                                const apdex = CalculateCompositeApdex("my.control4.com", combineData)

                                                const compositeApdex = [ 
                                                {
                                                    metadata: apdex.metadata,
                                                    data: [{y: apdex.compositeApdex}],
                                                },
                                                ]


                                                console.log("compositeApdex - " + apdex.appGroup, compositeApdex)

                                                return <BillboardChart fullWidth accountIds={queryAccountIds} data={compositeApdex}  />;
                                        }}
                                    </QueryGroup>
                                    </main>
                                </GridItem>

                                <GridItem className="primary-content-container" columnSpan={6}>
                                    <main className="primary-content full-height">
                                    <HeadingText spacingType={[HeadingText.SPACING_TYPE.MEDIUM]} type={HeadingText.TYPE.HEADING_4}>
                                        Composite Apdex NerdGraph Overall
                                    </HeadingText>
                                        <QueryGroup>
                                        <NerdGraphQuery query={overallMasterActQuery} variables={variables} />
                                        <NerdGraphQuery query={overallwebSvcActQuery} variables={variables} />
                                        <NerdGraphQuery query={overallovrcActQuery} variables={variables} />
                                            {(query1, query2, query3) => {
                                                if (query1.loading || query2.loading || query3.loading) {
                                                    return <Spinner />;
                                                }

                                                if (query1.error || query2.error || query3.error) {
                                                    console.log("Query1 Error", query1.error, "Query2 Error", query2.error);
                                                    return 'Error!';
                                                }

                                                
                                                const combineData = CombineQueryDataResults(query1.data.actor.account.nrql.results, query2.data.actor.account.nrql.results, query3.data.actor.account.nrql.results)
                                                const apdex = CalculateCompositeApdex("Overall", combineData)

                                                const compositeApdex = [ 
                                                {
                                                    metadata: apdex.metadata,
                                                    data: [{y: apdex.compositeApdex}],
                                                },
                                                ]


                                                console.log("compositeApdex - " + apdex.appGroup, compositeApdex)

                                                return <BillboardChart fullWidth accountIds={queryAccountIds} data={compositeApdex}  />;
                                        }}
                                    </QueryGroup>
                                    </main>
                                </GridItem>

                                <GridItem className="primary-content-container" columnSpan={6}>
                                    <main className="primary-content full-height">
                                    <HeadingText spacingType={[HeadingText.SPACING_TYPE.MEDIUM]} type={HeadingText.TYPE.HEADING_4}>
                                        Composite Apdex NerdGraph Timeseries my.constrol4.com
                                    </HeadingText>
                                        <QueryGroup>
                                        <NerdGraphQuery query={mycontrol4TimeseriesQuery1} variables={variables} />
                                        <NerdGraphQuery query={mycontrol4TimeseriesQuery2} variables={variables} />
                                            {(query1, query2) => {
                                                if (query1.loading || query2.loading) {
                                                    return <Spinner />;
                                                }

                                                if (query1.error || query2.error) {
                                                    console.log("Query1 Error", query1.error, "Query2 Error", query2.error);
                                                    return 'Error!';
                                                }

                                                console.log("Query Data", query1.data)
                                                console.log("Query Data", query2.data)
                                                
                                                const combineData = CombineQueryDataResults(query1.data.actor.account.nrql.results, query2.data.actor.account.nrql.results)
                                                const apdex = CalculateCompositeApdexTimeseries("my.control4.com", combineData)

                                                const compositeApdex = [ 
                                                {
                                                    metadata: apdex.metadata,
                                                    data: apdex.compositeApdexTimeseries,
                                                },
                                                ]


                                                console.log("compositeApdex - " + apdex.appGroup, compositeApdex)

                                                return <LineChart fullWidth accountIds={queryAccountIds} data={compositeApdex}  />;
                                        }}
                                    </QueryGroup>
                                    </main>
                                </GridItem>
                                
                            </Grid>
                        </>
                        );
                    }}
                    </PlatformStateContext.Consumer>
                </StackItem>
            </Stack>
        )
    }
}
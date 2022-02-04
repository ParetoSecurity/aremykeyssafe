1. Run

```shell
➜ gh api graphql --paginate -f query='
  query ($endCursor: String) {

      organization(login: "plone") {
        membersWithRole(first: 100, after: $endCursor) {
          nodes {
            name
            login
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
  }
  ' | jq .data.organization.membersWithRole.nodes[].login -cr
```

2. Scan

```shell
go run main.go plone > plone_report
```
import { STATUS_PAGE_PATH } from "../config.js"

export async function status(ctx) {
  let baseURL = ctx.site.baseURL
  ctx.body = (
    <div>
      <style>{`
          table {          
            border-collapse: collapse;          
            max-width: 100%;
            table-layout: fixed;
          }

          td, th {
            border: 1px solid gray;
            padding: 0.5rem;
            vertical-align: top;
            max-width:50%;
          }

          pre {
            margin: 0;            
            overflow: hidden;
            overflow-x: scroll;
            max-width: 50vw;
          }
          `}</style>
      <h1>Hostic Status</h1>
      <p>
        Base URL: <a href="/">{baseURL}</a>
      </p>
      <h3>Routes</h3>
      <table>
        <tr>
          <th>#</th>
          <th>Path</th>
          <th>Title</th>
          <th>Context</th>
        </tr>
        {ctx.site.routes
          .values()
          .filter((r) => r !== STATUS_PAGE_PATH)
          .map((r, i) => (
            <tr>
              <td align={"right"}>{i.toString()}</td>
              <td>
                <a href={r.path}>{r.path}</a>
              </td>
              <td>{r.title}</td>
              <td>
                {Object.entries(r)
                  .filter(([k, v]) => typeof v !== "function")
                  .map(([k, v]) => {
                    return (
                      <div>
                        <b>{k}</b> = {v}
                      </div>
                    )
                  })}
              </td>
            </tr>
          ))}
      </table>
    </div>
  )
}

---
to: "src/<%= h.inflection.dasherize(name) %>.vue"
---
<%
const filePath = h.inflection.dasherize(name).split('/')
const fileName = filePath[filePath.length - 1]
const importName = h.inflection.camelize(fileName.replace(/-/g, '_'))

if (blocks.indexOf('template') !== -1) {
%><template>
  <div><%= importName %></div>
</template>
<%
}

if (blocks.indexOf('script') !== -1) {
%>
<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class <%= importName %> extends Vue {<% if (blocks.indexOf('template') === -1) { %>
  render(h) {
    return <div><%= importName %></div>
  }<% } %>
}
</script>
<%
}
if (blocks.indexOf('style') !== -1) {
%>
<style lang="less">
</style><%
}
%>

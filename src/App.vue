<script>

export default {
  name: 'App',
};
</script>

<template>
  <div id="app">
    <header>
      <nav>
      <ul>
        <li class="nav-item">
          <router-link class="nav-link" to="/" exact>Simulator</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" to="/configuration">Configuration</router-link>
        </li>
      </ul>
      </nav>
    </header>
    <div class="container">
      <main>
        <router-view/>
      </main>
    </div>
  </div>
</template>

<style>
body {
  background: linear-gradient(to bottom, rgb(53, 53, 53), rgb(20, 20, 20));
  background-attachment: fixed;
}
header {
  background-color: rgba(68, 68, 68, 0.8);
  width: 964px;
  margin: 0 auto;
}
ul {
  padding: 3px;
  display: flex;
}
div {
  padding: 3px;
}
.nav-item {
  display: inline-block;
  padding: 5px 10px;
  font-size: 22px;
  border-right: 1px solid #bbb;
}
.nav-link {
  text-decoration: none;
  color: rgb(29, 9, 100);
}
.router-link-active {
  color: white;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
.container {
  display: flex;
  margin: 10px auto 0 auto;
  justify-content: center;
}
main {
  padding: 30px;
  background-color: white;
  width: 964px;
  min-height: 300px;
}
</style>

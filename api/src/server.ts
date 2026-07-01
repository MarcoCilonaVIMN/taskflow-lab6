import { app } from "./app";

const PORT = Number(process.env.PORT ?? 3000);

app.listen(PORT, () => {
  console.log(`TaskFlow API in ascolto su http://localhost:${PORT}`);
});

"use server";

import fs from "fs";

export const serverAction = async (data: any) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // 서버 자원 가져오는 것도 가능한가?
  const packageJson = fs.readFileSync("package.json", "utf8");
  console.log("packageJson", packageJson);
  const packageJsonObject = JSON.parse(packageJson);
  console.log("project-name:", packageJsonObject.name);
  console.log("서버 액션 데이터:", data);
};

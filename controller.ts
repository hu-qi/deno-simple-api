import UserItem from "./userItem.ts";
import db from "./db.ts";

let userItems = db;

const greet = ({ response }: { response: any }) => {
  response.status = 200;
  response.body = {
    message: "Hello Deno!",
  };
};

/**
* @description 获取所有
* @route GET /users
*/
const getUserItems = ({ response }: { response: any }) => {
  response.status = 200;
  response.body = userItems;
};

/**
* @description 通过 ID 获取
* @route GET /users/:id
*/
const getUserItem = (
  { params, response }: { params: { id: string }; response: any },
) => {
  const userItem: UserItem | undefined = searchUserItemById(params.id);
  if (userItem) {
    response.status = 200;
    response.body = userItem;
  } else {
    response.status = 404;
    response.body = { message: "User not found." };
  }
};

/**
* @description 创建用户
* @route POST /users
*/
const addUserItem = async (
  { request, response }: { request: any; response: any },
) => {
  const body = await request.body();
  const userItem: UserItem = await body.value;
  let isExist: UserItem | undefined = searchUserItemById(userItem.id);
  if (isExist) {
    response.body = { message: "The users already exist" };
  } else {
    userItems.push(userItem);
    response.body = { message: "OK" };
  }

  response.status = 200;
};

/**
* @description 通过 ID 更新用户 
* @route PUT /users/:id
*/
const updateUserItem = async (
  { params, request, response }: {
    params: { id: string };
    request: any;
    response: any;
  },
) => {
  let userItem: UserItem | undefined = searchUserItemById(params.id);
  if (userItem) {
    const body = await request.body();
    const updateInfos: {
      user_name?: string;
      company?: string;
      description?: string;
    } = await body.value;
    userItem = { ...userItem, ...updateInfos };
    userItems = [
      ...userItems.filter((userItem) => userItem.id !== params.id),
      userItem,
    ];
    response.status = 200;
    response.body = { message: "OK" };
  } else {
    response.status = 404;
    response.body = { message: `User not found` };
  }
};

/**
* @description 通过 id 删除一个用户
* @route DELETE /users/:id
*/
const deleteUserItem = (
  { params, response }: { params: { id: string }; response: any },
) => {
  userItems = userItems.filter((userItem) => userItem.id !== params.id);
  response.body = { message: "OK" };
  response.status = 200;
};

/**
* @description 查找用户
*/
const searchUserItemById = (id: string): (UserItem | undefined) =>
  userItems.filter((userItem) => userItem.id === id)[0];

export {
  greet,
  getUserItems,
  addUserItem,
  getUserItem,
  updateUserItem,
  deleteUserItem,
};

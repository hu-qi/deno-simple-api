import { Router } from 'https://deno.land/x/oak/mod.ts';
import { greet, getUserItems, addUserItem, getUserItem, updateUserItem, deleteUserItem } from './controller.ts';
 
const router = new Router();
 
router
.get('/', greet)
.get('/users', getUserItems)
.post('/users', addUserItem)
.get('/users/:id', getUserItem)
.put('/users/:id', updateUserItem)
.delete('/users/:id', deleteUserItem);
 
export default router;
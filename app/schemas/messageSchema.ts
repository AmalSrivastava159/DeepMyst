import {z} from "zod"

export const messageSchema = z.object({
    content: z
    .string()
    .min(10, {message: 'Content must be atleast of 10 charaters'})
    .max(300, ('Content must be no longer than 300 charaters'))
    
})
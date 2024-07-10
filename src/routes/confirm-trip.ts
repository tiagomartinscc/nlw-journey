import { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod"
import { prisma } from "../lib/prisma";
import dayjs from "dayjs"
import { getMailClient } from "../lib/mail";
import nodemailer from "nodemailer"

export async function confirmTrip(app:FastifyInstance) {
   await app.withTypeProvider<ZodTypeProvider>().get('/trips/:tripId/confirm', {
      schema: {
         params: z.object({
            tripId: z.string().uuid(),
         })
      }
   } ,async (request) => {
      
      
      return { tripId: request.params.tripId }
   })
}
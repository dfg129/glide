FROM public.ecr.aws/lambda/nodejs:14

COPY lib/handlers/handler.ts  package.json ${LAMBDA_TASK_ROOT}

RUN npm install

CMD [ "handler.run" ]

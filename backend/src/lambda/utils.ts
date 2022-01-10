import { APIGatewayProxyEvent } from "aws-lambda";
import { parseUserId } from "../auth/utils";

/**
 * Get a user id from an API Gateway s3
 * @param event an s3 from API Gateway
 *
 * @returns a user id from a JWT token
 */
export function getUserId(event: APIGatewayProxyEvent): string {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}
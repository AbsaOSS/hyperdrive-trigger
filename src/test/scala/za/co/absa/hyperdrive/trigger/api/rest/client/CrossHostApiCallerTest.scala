package za.co.absa.hyperdrive.trigger.api.rest.client

import org.scalatest.BeforeAndAfter
import org.scalatest.Matchers
import org.scalatest.mockito.MockitoSugar
import org.mockito.Mockito
import za.co.absa.hyperdrive.trigger.api.rest.client.CrossHostApiCaller.DefaultUrlsRetryCount
import org.springframework.web.client.ResourceAccessException
import org.scalatest.WordSpec


class CrossHostApiCallerTest extends WordSpec
  with Matchers
  with MockitoSugar
  with BeforeAndAfter {
  private val restClient = mock[RestClient]

  before {
    Mockito.reset(restClient)
  }

"CrossHostApiCaller" should {
    "cycle through urls" in {
      val crossHostApiCaller = CrossHostApiCaller(Vector("a", "b", "c", "d"), DefaultUrlsRetryCount,  startWith = Some(1))
      crossHostApiCaller.nextBaseUrl() should be("c")
      crossHostApiCaller.nextBaseUrl() should be("d")
      crossHostApiCaller.nextBaseUrl() should be("a")
      crossHostApiCaller.nextBaseUrl() should be("b")
      crossHostApiCaller.nextBaseUrl() should be("c")
    }
  }

  "CrossHostApiCaller::call" should {
    "return the result of the first successful call" when {
      "there are no failures" in {
        Mockito.when(restClient.sendGet[String]("a")).thenReturn("success")

        val result = CrossHostApiCaller(Vector("a", "b", "c"), DefaultUrlsRetryCount, startWith = Some(0)).call { str =>
          restClient.sendGet[String](str)
        }

        result should be("success")
        Mockito.verify(restClient, Mockito.only()).sendGet[String]("a")
      }

      "only some calls fail with a retryable exception" in {
        Mockito.when(restClient.sendGet[String]("a")).thenThrow(ApiClientException("Something went wrong A"))
        Mockito.when(restClient.sendGet[String]("b"))
          .thenThrow(ApiClientException("Something went wrong B"))
          .thenReturn("success")

        val result = CrossHostApiCaller(Vector("a", "b", "c"), 2, Some(0)).call { str =>
          restClient.sendGet[String](str)
        }

        result should be("success")
        Mockito.verify(restClient, Mockito.times(3)).sendGet[String]("a")
        Mockito.verify(restClient, Mockito.times(2)).sendGet[String]("b")
        Mockito.verify(restClient, Mockito.never()).sendGet[String]("c")
      }

      "despite retry count is negative" in {
        Mockito.when(restClient.sendGet[String]("a")).thenThrow(ApiClientException("Something went wrong A"))
        Mockito.when(restClient.sendGet[String]("b")).thenThrow(ApiClientException("Something went wrong B"))
        Mockito.when(restClient.sendGet[String]("c")).thenReturn("success")

        val result = CrossHostApiCaller(Vector("a", "b", "c"), -2, Some(0)).call { str =>
          restClient.sendGet[String](str)
        }

        result should be("success")
        Mockito.verify(restClient, Mockito.times(1)).sendGet[String]("a")
        Mockito.verify(restClient, Mockito.times(1)).sendGet[String]("b")
        Mockito.verify(restClient, Mockito.times(1)).sendGet[String]("c")
      }
    }

    "propagate the exception" when {
      "all calls fail with a retryable exception" in {
        Mockito.when(restClient.sendGet[String]("a")).thenThrow(ApiClientException("Something went wrong A"))
        Mockito.when(restClient.sendGet[String]("b")).thenThrow(ApiClientException("Something went wrong B"))
        Mockito.when(restClient.sendGet[String]("c")).thenThrow(ApiClientException("Something went wrong C"))

        val exception = intercept[ApiClientException] {
          CrossHostApiCaller(Vector("a", "b", "c"), 0, Some(0)).call { str =>
            restClient.sendGet[String](str)
          }
        }

        exception.getMessage should be("Something went wrong C")
        Mockito.verify(restClient, Mockito.times(1)).sendGet[String]("a")
        Mockito.verify(restClient, Mockito.times(1)).sendGet[String]("b")
        Mockito.verify(restClient, Mockito.times(1)).sendGet[String]("c")
      }

      "all calls fail with a retryable exception over multiple attempts" in {
        Mockito.when(restClient.sendGet[String]("a")).thenThrow(ApiClientException("Something went wrong A"))
        Mockito.when(restClient.sendGet[String]("b")).thenThrow(ApiClientException("Something went wrong B"))
        Mockito.when(restClient.sendGet[String]("c")).thenThrow(ApiClientException("Something went wrong C"))

        val exception = intercept[ApiClientException] {
          CrossHostApiCaller(Vector("a", "b", "c"), 1, Some(0)).call { str =>
            restClient.sendGet[String](str)
          }
        }

        exception.getMessage should be("Something went wrong C")
        Mockito.verify(restClient, Mockito.times(2)).sendGet[String]("a")
        Mockito.verify(restClient, Mockito.times(2)).sendGet[String]("b")
        Mockito.verify(restClient, Mockito.times(2)).sendGet[String]("c")
      }

      "any call fails with a non-retryable exception" in {
        Mockito.when(restClient.sendGet[String]("a")).thenThrow(new ResourceAccessException("Something went wrong A"))
        Mockito.when(restClient.sendGet[String]("b")).thenThrow(UnauthorizedException("Wrong credentials"))

        val exception = intercept[UnauthorizedException] {
          CrossHostApiCaller(Vector("a", "b", "c"), 0, Some(0)).call { str =>
            restClient.sendGet[String](str)
          }
        }

        exception.getMessage should be("Wrong credentials")
        Mockito.verify(restClient, Mockito.times(1)).sendGet[String]("a")
        Mockito.verify(restClient, Mockito.times(1)).sendGet[String]("b")
        Mockito.verify(restClient, Mockito.never()).sendGet[String]("c")
      }
    }

    "fail on not having Urls" when {
      "none are provided" in {
        val exception = intercept[IndexOutOfBoundsException] {
          CrossHostApiCaller(Vector()).call { str =>
            restClient.sendGet[String](str)
          }
        }
        exception.getMessage should be ("0")
      }
    }
  }
}

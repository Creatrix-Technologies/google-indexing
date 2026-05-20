// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import CrawlIndexDetails from '../src/pages/CrawlIndexDetails.vue'
import api from '../src/api'

vi.mock('../src/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { siteId: '42' } }),
  RouterLink: { template: '<a><slot /></a>' },
}))

vi.mock('../src/Shared/entitlements', () => ({
  useEntitlementsStore: () => ({
    blockingReason: '',
    canUsePaidFeatures: true,
    isChecking: false,
    refresh: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('vue-toastification', () => ({
  useToast: () => ({
    error: vi.fn(),
    success: vi.fn(),
  }),
}))

vi.mock('vue-loading-overlay', () => ({
  default: { template: '<div />' },
}))

const makeUrl = (id: number, url: string) => ({
  id,
  url,
  coverageState: '',
  indexingState: '',
  statusCode: 200,
  crawledAt: '',
  indexedAt: '',
  indexedResult: '',
  indexedStatus: '',
  type: '',
  priority: '',
  verdit: '',
  pageFetchSpecified: '',
  robotsTxtState: '',
})

const detailsResponse = (page: number) => ({
  data: {
    data: page === 1 ? [makeUrl(101, 'https://example.com/one')] : [makeUrl(202, 'https://example.com/two')],
    pageInfo: {
      page,
      pageSize: 10,
      totalCount: 2,
      hasPreviousPage: page > 1,
      hasNextPage: page < 2,
    },
  },
})

describe('CrawlIndexDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.stubGlobal(
      'EventSource',
      class {
        onmessage: ((event: MessageEvent) => void) | null = null
        onerror: (() => void) | null = null
        close = vi.fn()
      },
    )

    vi.mocked(api.get).mockImplementation((url: string, config?: { params?: { PageNo?: number } }) => {
      if (url === '/crawl/42/details') {
        return Promise.resolve(detailsResponse(config?.params?.PageNo ?? 1))
      }
      if (url === '/crawl/42/details-count') {
        return Promise.resolve({
          data: {
            data: {
              totalCount: 2,
              successCount: 2,
              failedCount: 0,
              indexedSucceed: 0,
              deIndexedSucceed: 0,
              indexedFailed: 0,
              indexedQueued: 0,
              hasDailyQuotaExceed: false,
              site: { type: 'Domain', name: 'Example', url: 'https://example.com', scheduleMessage: '' },
            },
          },
        })
      }
      if (url === '/crawl/index-limit') {
        return Promise.resolve({ data: { isSuccess: true, data: false } })
      }
      return Promise.reject(new Error(`Unhandled GET ${url}`))
    })
  })

  it('clears bulk URL selection when changing pages', async () => {
    const wrapper = mount(CrawlIndexDetails, {
      global: {
        stubs: {
          Teleport: true,
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    })
    await flushPromises()

    const rowCheckbox = wrapper.findAll('input[type="checkbox"]')[1]
    await rowCheckbox.setValue(true)
    expect(wrapper.text()).toContain('Index queue (1)')

    const nextButton = wrapper.findAll('button').find(button => button.text() === 'Next')
    await nextButton?.trigger('click')
    await flushPromises()

    expect(wrapper.text()).not.toContain('Index queue (1)')
  })
})

<template>
  <div v-if="loading" class="load"></div>
  <div v-else class="content">
    <div class="seriesTab">
      <div class="seriesTab-list">
        <!-- <div class="seriesTab-item">
          {{ pageText }}
        </div>
        <template v-if="num > size">
          <div class="seriesTab-item">
            <n-button @click="BackPage()" strong secondary circle>
              <i class="bx bx-left-arrow-alt"></i>
            </n-button>
          </div>
          <div class="seriesTab-item">
            <n-button @click="NextPage()" strong secondary circle>
              <i class="bx bx-right-arrow-alt"></i>
            </n-button>
          </div>
        </template> -->
        <n-pagination
          v-model:page="page"
          :page-count="pageCount"
          @update:page="handlePageChange"
        />
        <div class="seriesTab-item">
          {{ pageText }}
        </div>
        <div class="seriesTab-item">
          <n-button @click="showSort = !showSort" strong secondary circle>
            <i class="bx bx-align-middle"></i>
          </n-button>
        </div>
        <div class="seriesTab-item">
          <n-button @click="showFilter = !showFilter" strong secondary circle>
            <i class="bx bx-filter"></i>
          </n-button>
        </div>
      </div>
    </div>
    <div class="card-show-content view-card-list">
      <div class="view-item" v-for="(item, index) in data" :key="index">
        <router-link
          :to="{
            path: '/video',
            query: {
              id: item.id,
              gallery_type: gallery_type,
            },
          }"
        >
          <div class="view-item-header">
            <div class="view-item-tag-list">
              <n-tag
                class="view-item-tag"
                :color="{
                  color: '#f0a020',
                  textColor: '#fff',
                  borderColor: '#f0a020',
                }"
              >
                {{
                  isNaN(Math.floor(item.vote_average * 100) / 100)
                    ? ""
                    : Math.floor(item.vote_average * 100) / 100
                }}
              </n-tag>
              <div class="flex-row">
                <div
                  v-if="item.played"
                  class="view-item-tag count"
                  title="已播放"
                >
                  <i class="bx bx-check"></i>
                </div>
                <n-badge
                  value="New"
                  v-if="handleShowNewBadge(item.last_air_date)"
                  class="new-badge"
                ></n-badge>
              </div>
            </div>
          </div>
          <img
            loading="lazy"
            class="carousel-img"
            :src="COMMON.imgUrl + '/t/p/w220_and_h330_face' + item.poster_path"
          />
          <div v-if="item.video != null" class="view-item-title">
            {{ item.title }}
          </div>
          <div v-else class="view-item-title">
            {{ item.name }}
          </div>
        </router-link>
      </div>
    </div>
    <n-modal v-model:show="showSort" transform-origin="center">
      <n-card
        style="width: 600px"
        title="排序"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button @click="showSort = !showSort" strong secondary circle>
            <i class="bx bx-x"></i>
          </n-button>
        </template>
        <div class="sort-list">
          <div class="sort-title">排序方式</div>
          <div class="sort-list">
            <n-radio-group v-model:value="mode" name="radiogroup">
              <n-space vertical>
                <n-radio
                  @change="handleChange"
                  class="sort-item"
                  v-for="item in modes"
                  :checked="mode === item.value"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </n-radio>
              </n-space>
            </n-radio-group>
          </div>
          <div class="sort-title">排序顺序</div>
          <div class="sort-list">
            <n-radio-group v-model:value="order" name="radiogroup">
              <n-space vertical>
                <n-radio
                  @change="handleChange"
                  class="sort-item"
                  v-for="item in orders"
                  :checked="order === item.value"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </n-radio>
              </n-space>
            </n-radio-group>
          </div>
        </div>
      </n-card>
    </n-modal>
    <n-modal v-model:show="showFilter" transform-origin="center">
      <n-card
        style="width: 600px"
        title="筛选"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button @click="showFilter = !showFilter" strong secondary circle>
            <i class="bx bx-x"></i>
          </n-button>
        </template>
        <div class="sort-title">风格</div>
        <div class="sort-list">
          <n-radio-group v-model:value="genre" name="radiogroup">
            <n-space vertical>
              <n-radio
                @change="filterChange"
                class="sort-item"
                v-for="item in filters"
                :key="item"
                :value="item"
              >
                {{ item.name }}
              </n-radio>
            </n-space>
          </n-radio-group>
        </div>
      </n-card>
    </n-modal>
  </div>
</template>

<script>
import { getCurrentInstance, onMounted, ref } from "vue";
import { onBeforeRouteUpdate } from "vue-router";
import { handleShowNewBadge } from "@/utils";
export default {
  name: "VideoList",
  setup() {
    const gallery_uid = ref(null);
    const gallery_type = ref(null);
    const pageSize = ref(null);
    const page = ref(null);
    const data = ref(null);

    const filters = ref(null);
    const error = ref(null);
    const loading = ref(true);
    const { proxy } = getCurrentInstance();
    const num = ref(null);
    const search = ref(false);
    const mode = ref("updated_at");
    const order = ref("desc");
    const genre = ref("");
    const year = ref("");
    const pageCount = ref(0);
    gallery_uid.value = proxy.$route.query.gallery_uid;
    gallery_type.value = proxy.$route.query.gallery_type;
    pageSize.value = 24;
    page.value = 1;

    const per_card = ref(8);
    if (proxy.COMMON.isMo) {
      per_card.value = 3;
    }
    const pageText = ref(null);

    let page_str = localStorage.getItem("page");
    if (page_str != null) {
      page.value = parseInt(page_str);
    }
    function init(gallery_uid) {
      let sider_items = document.querySelectorAll(".sider-item a");
      sider_items.forEach((event) => {
        event.classList.remove("active");
      });
      sider_items.forEach((event) => {
        let title = event.querySelector(".title");
        if (title.dataset.id == gallery_uid) {
          event.classList.add("active");
        }
      });
    }

    function initPageText() {
      let si = pageSize.value;
      if (num.value < pageSize.value) {
        si = num.value;
      }
      localStorage.setItem("page", page.value);
      pageText.value = `共${num.value}个`;
      pageCount.value = Math.ceil(num.value / pageSize.value);
      // (page.value - 1) * pageSize.value + "-" + ((page.value - 1) * pageSize.value + si);
    }

    function fetchGenreData() {
      let api = `${proxy.COMMON.apiUrl}/v1/api/genre/list?page=1&size=100`;
      proxy.axios
        .post(
          api,
          {},
          {
            headers: {
              "content-type": "application/json",
              Authorization: proxy.$cookies.get("Authorization"),
            },
          }
        )
        .then((res) => {
          if (res.data.code == 200) {
            filters.value = res.data.data;
          }
          loading.value = false;
        })
        .catch((error) => {
          proxy.COMMON.ShowMsg(error);
        });
    }

    function fetchData() {
      let api = `${proxy.COMMON.apiUrl}/v1/api/thetv/sort?gallery_uid=${gallery_uid.value}&mode=${mode.value}&order=${order.value}&page=${page.value}&size=${pageSize.value}`;
      if (gallery_type.value == "movie") {
        api = `${proxy.COMMON.apiUrl}/v1/api/themovie/sort?gallery_uid=${gallery_uid.value}&mode=${mode.value}&order=${order.value}&page=${page.value}&size=${pageSize.value}`;
      }
      proxy.axios
        .post(
          api,
          {},
          {
            headers: {
              "content-type": "application/json",
              Authorization: proxy.$cookies.get("Authorization"),
            },
          }
        )
        .then((res) => {
          if (res.data.code == 200) {
            data.value = res.data.data;
            num.value = res.data.num;

            init(gallery_uid.value);
            initPageText();
            fetchGenreData();
          }
        })
        .catch((error) => {
          proxy.COMMON.ShowMsg(error);
        });
    }

    function fetchfilterData(id) {
      let api = `${proxy.COMMON.apiUrl}/v1/api/genre/filte?id=${id}&gallery_uid=${gallery_uid.value}&gallery_type=${gallery_type.value}&mode=${mode.value}&order=${order.value}&page=${page.value}&size=${pageSize.value}`;
      proxy.axios
        .post(
          api,
          {},
          {
            headers: {
              "content-type": "application/json",
              Authorization: proxy.$cookies.get("Authorization"),
            },
          }
        )
        .then((res) => {
          if (res.data.code == 200) {
            if (gallery_type.value == "movie") {
              if (res.data.data.the_movies == null) {
                proxy.COMMON.ShowMsg("未查询到相关内容!");
              }
              data.value = res.data.data.the_movies;
            } else {
              if (res.data.data.the_tvs == null) {
                proxy.COMMON.ShowMsg("未查询到相关内容!");
              }
              data.value = res.data.data.the_tvs;
            }
            num.value = res.data.num;
            initPageText();
          }
        })
        .catch((error) => {
          proxy.COMMON.ShowMsg(error);
        });
    }

    onBeforeRouteUpdate((to, from) => {
      gallery_uid.value = to.query.gallery_uid;
      gallery_type.value = to.query.gallery_type;
      fetchData();
    });

    const refresh = () => {
      fetchData();
    };

    onMounted(() => {
      fetchData();
    });

    return {
      handleShowNewBadge,
      gallery_type,
      per_card,
      data,
      loading,
      error,
      page,
      pageSize,
      num,
      search,
      pageText,
      pageCount,
      filters,
      genre,
      year,
      refresh,
      handleChange(e) {
        page.value = 1;
        fetchData();
      },
      filterChange(e) {
        page.value = 1;
        fetchfilterData(genre.value.id);
      },
      showSort: ref(false),
      showFilter: ref(false),
      mode: mode,
      modes: [
        {
          value: "updated_at",
          label: "更新时间",
        },
        {
          value: "created_at",
          label: "加入时间",
        },
        {
          value: "vote_average",
          label: "评分",
        },
        {
          value: "release_date",
          label: "发行时间",
        },
      ].map((s) => {
        s.value = s.value.toLowerCase();
        return s;
      }),
      order: order,
      orders: [
        {
          value: "ASC",
          label: "升序",
        },
        {
          value: "DESC",
          label: "降序",
        },
      ].map((s) => {
        s.value = s.value.toLowerCase();
        return s;
      }),
    };
  },
  methods: {
    BackPage() {
      this.page = this.page - 1;
      if (this.page <= 0) {
        this.COMMON.ShowMsg("已经是第1页啦!");
        this.page = 1;
      }
      this.refresh();
    },
    NextPage() {
      this.page = this.page + 1;
      this.refresh();
    },
    handlePageChange(page) {
      this.page = page;
      this.refresh();
    },
  },
};
</script>

<style scoped>
.seriesTab {
  margin-top: 20px;
  margin-bottom: 20px;
  text-align: center;
}

.seriesTab .seriesTab-list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.sort-title {
  font-size: 1.2em;
  margin-top: 12px;
  margin-bottom: 12px;
}

.sort-list .sort-item {
  font-size: 1.2em;
  margin-top: 4px;
  margin-bottom: 4px;
}

.view-card-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, 11.5%);
  grid-gap: 6px;
  justify-content: space-between;
}

@media (max-width: 750px) {
  .view-card-list {
    grid-template-columns: repeat(auto-fill, 31%);
  }
}

.card-show-title {
  font-size: 1.2em;
  font-weight: 400;
  padding-bottom: 16px;
}

.card-shows {
  margin-bottom: 20px;
}

.view-item {
  text-align: center;
}

.view-card-list img.carousel-img {
  width: 100%;
  aspect-ratio: 11/16;
  border-radius: 5px;
}

.view-card-list .view-item {
  transform: translateY(0) scale(1);
  transition: all 0.2s ease-in-out;
}

.view-card-list .view-item:hover {
  transform: translateY(-4px) scale(0.95);
  transition: all 0.2s ease-in-out;
}

.view-item-header {
  position: absolute;
  width: 95%;
  padding-left: 4px;
}

.view-item-tag-list {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.view-item-tag-list .count {
  background-color: #2d8cf0 !important;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  color: white;
  padding: 4px;
  text-align: center;
}

.rating {
  color: yellow;
}

.project {
  margin-top: 10px;
}

.project .n-pagination {
  float: right;
}

@media (max-width: 767px) {
  .card-show-title {
    font-size: 0.8em;
    font-weight: 400;
    padding-bottom: 10px;
  }

  .view-item-title {
    font-size: 0.5em;
    font-weight: 400;
  }

  .custom-arrow.next {
    bottom: 60px;
  }
}
</style>
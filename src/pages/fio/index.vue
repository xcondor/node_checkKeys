<template>
  <div>{{$t('common').abnormal}}- {{time}}</div>
</template>
<script>
export default {
  data() {
    return {
      title: this.$t("common").inProcess,
      msg: this.$t("common").Free,
      time: performance.now()
    };
  }
};
</script>

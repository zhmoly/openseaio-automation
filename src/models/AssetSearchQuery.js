class AssetSearchQuery {

    constructor(collectionName, searchParams) {

        this.collection = collectionName;

        this.sortAsc = false;
        this.sortBy = '';
        this.stringTraits = [];
        this.toggles = [];
        this.priceFilter = {};

        searchParams.forEach(searchParam => {
            let param = searchParam.split('=');
            let key = param[0];
            let val = window.decodeURIComponent(param[1]);

            if (key === 'search[sortAscending]') {
                if (val === 'true') {
                    this.sortAsc = true;
                }
            }
            else if (key === 'search[sortBy]') {
                this.sortBy = val;
            }
            else if (key.indexOf('search[toggles]') === 0) {
                this.toggles.push(val);
            }
            else if (key === 'search[priceFilter][symbol]') {
                this.priceFilter['symbol'] = val;
            }
            else if (key === 'search[priceFilter][min]') {
                this.priceFilter['min'] = val;
            }
            else if (key === 'search[priceFilter][max]') {
                this.priceFilter['max'] = val;
            }
            else if (key.indexOf('search[stringTraits]') === 0) {

                key = key.split('search[stringTraits]')[1];

                // Get string traits index
                let tempSegs = key.split('[');
                let traitIdx = tempSegs[1].split(']')[0];

                key = tempSegs[2].split(']')[0];
                if (key === 'name') {
                    this.stringTraits[traitIdx] = {
                        'name': val,
                        'values': []
                    }
                }
                else if (key === 'values') {
                    this.stringTraits[traitIdx]['values'].push(val);
                }
            }
        })

        console.log(this.collection, this.stringTraits, this.priceFilter);
    }

    buildQuery = () => {

        const count = 100;
        const cursor = null;
        const query = "query AssetSearchQuery(\n  $categories: [CollectionSlug!]\n  $chains: [ChainScalar!]\n  $collection: CollectionSlug\n  $collectionQuery: String\n  $collectionSortBy: CollectionSort\n  $collections: [CollectionSlug!]\n  $count: Int\n  $cursor: String\n  $identity: IdentityInputType\n  $includeHiddenCollections: Boolean\n  $numericTraits: [TraitRangeType!]\n  $paymentAssets: [PaymentAssetSymbol!]\n  $priceFilter: PriceFilterType\n  $query: String\n  $resultModel: SearchResultModel\n  $showContextMenu: Boolean = false\n  $shouldShowQuantity: Boolean = false\n  $sortAscending: Boolean\n  $sortBy: SearchSortBy\n  $stringTraits: [TraitInputType!]\n  $toggles: [SearchToggle!]\n  $creator: IdentityInputType\n  $assetOwner: IdentityInputType\n  $isPrivate: Boolean\n  $safelistRequestStatuses: [SafelistRequestStatus!]\n) {\n  query {\n    ...AssetSearch_data_2hBjZ1\n  }\n}\n\nfragment AssetCardContent_asset on AssetType {\n  relayId\n  name\n  ...AssetMedia_asset\n  assetContract {\n    address\n    chain\n    openseaVersion\n    id\n  }\n  tokenId\n  collection {\n    slug\n    id\n  }\n  isDelisted\n}\n\nfragment AssetCardContent_assetBundle on AssetBundleType {\n  assetQuantities(first: 18) {\n    edges {\n      node {\n        asset {\n          relayId\n          ...AssetMedia_asset\n          id\n        }\n        id\n      }\n    }\n  }\n}\n\nfragment AssetCardFooter_assetBundle on AssetBundleType {\n  name\n  assetCount\n  assetQuantities(first: 18) {\n    edges {\n      node {\n        asset {\n          collection {\n            name\n            relayId\n            isVerified\n            id\n          }\n          id\n        }\n        id\n      }\n    }\n  }\n  assetEventData {\n    lastSale {\n      unitPriceQuantity {\n        ...AssetQuantity_data\n        id\n      }\n    }\n  }\n  orderData {\n    bestBid {\n      orderType\n      paymentAssetQuantity {\n        ...AssetQuantity_data\n        id\n      }\n    }\n    bestAsk {\n      closedAt\n      orderType\n      dutchAuctionFinalPrice\n      openedAt\n      priceFnEndedAt\n      quantity\n      decimals\n      paymentAssetQuantity {\n        quantity\n        ...AssetQuantity_data\n        id\n      }\n    }\n  }\n}\n\nfragment AssetCardFooter_asset_fdERL on AssetType {\n  ownedQuantity(identity: $identity) @include(if: $shouldShowQuantity)\n  name\n  tokenId\n  collection {\n    name\n    isVerified\n    id\n  }\n  hasUnlockableContent\n  isDelisted\n  isFrozen\n  assetContract {\n    address\n    chain\n    openseaVersion\n    id\n  }\n  assetEventData {\n    firstTransfer {\n      timestamp\n    }\n    lastSale {\n      unitPriceQuantity {\n        ...AssetQuantity_data\n        id\n      }\n    }\n  }\n  decimals\n  orderData {\n    bestBid {\n      orderType\n      paymentAssetQuantity {\n        ...AssetQuantity_data\n        id\n      }\n    }\n    bestAsk {\n      closedAt\n      orderType\n      dutchAuctionFinalPrice\n      openedAt\n      priceFnEndedAt\n      quantity\n      decimals\n      paymentAssetQuantity {\n        quantity\n        ...AssetQuantity_data\n        id\n      }\n    }\n  }\n}\n\nfragment AssetCardHeader_data_27d9G3 on AssetType {\n  relayId\n  favoritesCount\n  isDelisted\n  isFavorite\n  ...AssetContextMenu_data_3z4lq0 @include(if: $showContextMenu)\n}\n\nfragment AssetContextMenu_data_3z4lq0 on AssetType {\n  ...asset_edit_url\n  ...itemEvents_data\n  isDelisted\n  isEditable {\n    value\n    reason\n  }\n  isListable\n  ownership(identity: {}) {\n    isPrivate\n    quantity\n  }\n  creator {\n    address\n    id\n  }\n  collection {\n    isAuthorizedEditor\n    id\n  }\n}\n\nfragment AssetMedia_asset on AssetType {\n  animationUrl\n  backgroundColor\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    id\n  }\n  isDelisted\n  displayImageUrl\n}\n\nfragment AssetQuantity_data on AssetQuantityType {\n  asset {\n    ...Price_data\n    id\n  }\n  quantity\n}\n\nfragment AssetSearchFilter_data_3KTzFc on Query {\n  ...CollectionFilter_data_2qccfC\n  collection(collection: $collection) {\n    numericTraits {\n      key\n      value {\n        max\n        min\n      }\n      ...NumericTraitFilter_data\n    }\n    stringTraits {\n      key\n      ...StringTraitFilter_data\n    }\n    id\n  }\n  ...PaymentFilter_data_2YoIWt\n}\n\nfragment AssetSearchList_data_3Aax2O on SearchResultType {\n  asset {\n    assetContract {\n      address\n      chain\n      id\n    }\n    collection {\n      isVerified\n      id\n    }\n    relayId\n    tokenId\n    ...AssetSelectionItem_data\n    ...asset_url\n    id\n  }\n  assetBundle {\n    relayId\n    id\n  }\n  ...Asset_data_3Aax2O\n}\n\nfragment AssetSearch_data_2hBjZ1 on Query {\n  ...CollectionHeadMetadata_data_2YoIWt\n  ...AssetSearchFilter_data_3KTzFc\n  ...SearchPills_data_2Kg4Sq\n  search(after: $cursor, chains: $chains, categories: $categories, collections: $collections, first: $count, identity: $identity, numericTraits: $numericTraits, paymentAssets: $paymentAssets, priceFilter: $priceFilter, querystring: $query, resultType: $resultModel, sortAscending: $sortAscending, sortBy: $sortBy, stringTraits: $stringTraits, toggles: $toggles, creator: $creator, isPrivate: $isPrivate, safelistRequestStatuses: $safelistRequestStatuses) {\n    edges {\n      node {\n        ...AssetSearchList_data_3Aax2O\n        __typename\n      }\n      cursor\n    }\n    totalCount\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment AssetSelectionItem_data on AssetType {\n  backgroundColor\n  collection {\n    displayData {\n      cardDisplayStyle\n    }\n    imageUrl\n    id\n  }\n  imageUrl\n  name\n  relayId\n}\n\nfragment Asset_data_3Aax2O on SearchResultType {\n  asset {\n    isDelisted\n    ...AssetCardHeader_data_27d9G3\n    ...AssetCardContent_asset\n    ...AssetCardFooter_asset_fdERL\n    ...AssetMedia_asset\n    ...asset_url\n    ...itemEvents_data\n    id\n  }\n  assetBundle {\n    ...bundle_url\n    ...AssetCardContent_assetBundle\n    ...AssetCardFooter_assetBundle\n    id\n  }\n}\n\nfragment CollectionFilter_data_2qccfC on Query {\n  selectedCollections: collections(first: 25, collections: $collections, includeHidden: true) {\n    edges {\n      node {\n        assetCount\n        imageUrl\n        name\n        slug\n        id\n      }\n    }\n  }\n  collections(assetOwner: $assetOwner, assetCreator: $creator, onlyPrivateAssets: $isPrivate, chains: $chains, first: 100, includeHidden: $includeHiddenCollections, parents: $categories, query: $collectionQuery, sortBy: $collectionSortBy) {\n    edges {\n      node {\n        assetCount\n        imageUrl\n        name\n        slug\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n}\n\nfragment CollectionHeadMetadata_data_2YoIWt on Query {\n  collection(collection: $collection) {\n    bannerImageUrl\n    description\n    imageUrl\n    name\n    id\n  }\n}\n\nfragment CollectionModalContent_data on CollectionType {\n  description\n  imageUrl\n  name\n  slug\n}\n\nfragment NumericTraitFilter_data on NumericTraitTypePair {\n  key\n  value {\n    max\n    min\n  }\n}\n\nfragment PaymentFilter_data_2YoIWt on Query {\n  paymentAssets(first: 10) {\n    edges {\n      node {\n        symbol\n        relayId\n        id\n        __typename\n      }\n      cursor\n    }\n    pageInfo {\n      endCursor\n      hasNextPage\n    }\n  }\n  PaymentFilter_collection: collection(collection: $collection) {\n    paymentAssets {\n      symbol\n      relayId\n      id\n    }\n    id\n  }\n}\n\nfragment Price_data on AssetType {\n  decimals\n  imageUrl\n  symbol\n  usdSpotPrice\n  assetContract {\n    blockExplorerLink\n    chain\n    id\n  }\n}\n\nfragment SearchPills_data_2Kg4Sq on Query {\n  selectedCollections: collections(first: 25, collections: $collections, includeHidden: true) {\n    edges {\n      node {\n        imageUrl\n        name\n        slug\n        ...CollectionModalContent_data\n        id\n      }\n    }\n  }\n}\n\nfragment StringTraitFilter_data on StringTraitType {\n  counts {\n    count\n    value\n  }\n  key\n}\n\nfragment asset_edit_url on AssetType {\n  assetContract {\n    address\n    chain\n    id\n  }\n  tokenId\n  collection {\n    slug\n    id\n  }\n}\n\nfragment asset_url on AssetType {\n  assetContract {\n    address\n    chain\n    id\n  }\n  tokenId\n}\n\nfragment bundle_url on AssetBundleType {\n  slug\n}\n\nfragment itemEvents_data on AssetType {\n  assetContract {\n    address\n    chain\n    id\n  }\n  tokenId\n}";

        const variables = {
            "categories": null,
            "chains": null,
            "collection": this.collection,
            "collectionQuery": null,
            "collectionSortBy": null,
            "collections": [
                this.collection
            ],
            "count": count,
            "cursor": cursor,
            "identity": null,
            "includeHiddenCollections": null,
            "numericTraits": null,
            "paymentAssets": null,
            "priceFilter": this.priceFilter.symbol ? this.priceFilter : null,
            "query": "",
            "resultModel": "ASSETS",
            "showContextMenu": true,
            "shouldShowQuantity": false,
            "sortAscending": true,
            "sortBy": "PRICE",
            "stringTraits": this.stringTraits,
            "toggles": this.toggles,
            "creator": null,
            "assetOwner": null,
            "isPrivate": null,
            "safelistRequestStatuses": null
        };

        let searchQuery = {
            'id': 'AssetSearchQuery',
            'query': query,
            'variables': variables
        };

        return searchQuery;
    }

};

export default AssetSearchQuery;

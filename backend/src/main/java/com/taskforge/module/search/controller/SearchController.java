package com.taskforge.module.search.controller;

import com.taskforge.common.api.ApiResponse;
import com.taskforge.module.search.dto.GlobalSearchResponse;
import com.taskforge.module.search.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/search")
@Tag(name = "Global Search", description = "Endpoints for keyword-based global search across multiple entities")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    @Operation(summary = "Perform global keyword search", description = "Returns aggregated lists of matching projects, tasks, comments, and users")
    public ResponseEntity<ApiResponse<GlobalSearchResponse>> globalSearch(@RequestParam("query") String query) {
        GlobalSearchResponse response = searchService.globalSearch(query);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
